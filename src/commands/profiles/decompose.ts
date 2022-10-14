import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as xmlParser from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import Utils from '../../lib/utils';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname, true, 'sfdx-profile-decompose');

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-profile-decompose', 'decompose');

/**
 * Really just a nested hash where the top-level hash uses the metadata property
 * types ('fieldPermissions', 'objectPermissions', etc) as keys
 * and the nested hash uses object types as keys.
 * Values are arrays of properties.
 */
class DecomposedEntity {
    public globalProps: object;
    private propMap;

    constructor(public componentName: string) {
        this.propMap = {};
    }

    /**
     * Set properties by type and object.
     * @param propertyType
     * @param objectName
     * @param props
     */
    public putProps(propertyType: string, objectName: string, props): void {
        let objectMap = this.propMap[propertyType];
        if (null == objectMap) {
            objectMap = {};
            this.propMap[propertyType] = objectMap;
        }
        if (!objectMap[objectName]) {
            objectMap[objectName] = [];
        }
        objectMap[objectName].push(props);
    }

    /**
     * Get properties by type and object name.
     * @param propertyType
     * @param objectName
     */
    public getProps(propertyType: string, objectName: string): object {
        const objectMap = this.propMap[propertyType];
        if (objectMap) {
            return objectMap[objectName];
        }
        return null;
    }

    /**
     * Get the names of the various property types stored in this metadata component.
     */
    public getPropertyTypes(): string[] {
        return Object.keys(this.propMap);
    }

    /**
     * Get the names of the objects which have properties of a specified type.
     * @param propType
     */
    public getObjectsForPropertyType(propType: string): string[] {
        const objMap = this.propMap[propType];
        if (objMap) {
            return Object.keys(objMap);
        }
        return null;
    }

}

class PermMatcher {
    constructor(readonly matchConfig: object) {
    }
    public matches(componentProp: object): boolean {
        let match = true;
        for (const propName of Object.keys(this.matchConfig)) { // iterate over configured properties
            if (!(componentProp[propName] && componentProp[propName] === this.matchConfig[propName])) {
                match = false;
                break;
            }
        }
        return match;
    }
}

/**
 * A CLI command which breaks monolithic profile files down into separate per-property type, per-object files.
 */
export default class Decompose extends SfdxCommand {

    public static description: string = messages.getMessage('commandDescription');
    public static examples = [
        '$ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed',
        '$ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed --no-prod',
        '$ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed --md-types=profiles'
    ];

    public static args = [];
    protected static flagsConfig = {
        'source-path': flags.directory({ char: 's', description: messages.getMessage('sourcePathFlagDescription'), default: Utils.DEFAULT_SOURCE_PATH }),
        'decompose-dir': flags.string({ char: 'd', description: messages.getMessage('decomposeDirFlagDescription'), default: Utils.DEFAULT_DECOMPOSE_DIR }),
        'no-prod': flags.boolean({ char: 'n', description: messages.getMessage('noProdFlagDescription')}),
        'md-types': flags.array({char: 'm', description: messages.getMessage('metadataTypesFlagDescription'), default: ['profiles', 'permissionsets']})
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = false;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = false;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = false;

    private static stripProps(component: object, componentType: string): object {
        Object.keys(Utils.STRIP_PROPS).forEach(permissionType => {
            const permMatchers = Utils.STRIP_PROPS[permissionType].map(matchConfig => new PermMatcher(matchConfig));
            let permissions = component[componentType][permissionType];
            if (permissions) {
                if (!Array.isArray(permissions)) { // force it to an array, in case there was only 1
                    permissions = [permissions];
                }
                // filter the component permissions down to the set that don't match any of the configured matchers
                component[componentType][permissionType] = permissions.filter(perm => !permMatchers.some(matcher => matcher.matches(perm)));
            }
        });
        return component;
    }

    /**
     * Run the command.
     */
    public async run(): Promise<AnyJson> {
        const sourcePath = this.flags['source-path'];
        if (!fs.existsSync(sourcePath)) {
            throw new SfdxError(messages.getMessage('errorSourcePathNotFound', [`directory ${sourcePath} not found.    Use the 'source-path' flag to override the default location.`]));
        }
        const decomposeDir = this.flags['decompose-dir'] || Utils.DEFAULT_DECOMPOSE_DIR;
        const mdTypes = this.flags['md-types'];
        const processedComponents = {};
        await Promise.all(mdTypes.map(async mdType => {
            const mdSourcePath = path.join(sourcePath, mdType);
            const mdDecomposedPath = path.join(mdSourcePath, decomposeDir);
            if (!fs.existsSync(mdDecomposedPath)) {
                throw new SfdxError(messages.getMessage('errorDecomposeDirNotFound', [`directory ${mdDecomposedPath} not found.  Use the 'decompose-dir' flag to override the default location.`]));
            }
            const mdConfig = Utils.MD_TYPE_CONFIGS[mdType];
            const files: fs.Dirent[] = await fs.promises.readdir(mdSourcePath, { withFileTypes: true });
            const names: string[] = await Promise.all(files.filter(f => f.isFile() && f.name.endsWith(mdConfig.mdSuffix))
                .map(async f => {
                    const fileName = `${mdSourcePath}/${f.name}`;
                    let mdComponent: object = null;
                    try {
                        const xmlData: Buffer = await fs.promises.readFile(fileName);
                        const xmlStr: string = xmlData.toString('utf-8');
                        mdComponent = xmlParser.parse(xmlStr, { ignoreNameSpace: true });
                    } catch (error) {
                        throw new SfdxError(messages.getMessage('errorXmlParse', [`Parsing ${fileName} failed.`]));
                    }
                    const componentName: string = f.name.substring(0, f.name.indexOf('.'));
                    const decomposed: DecomposedEntity = this.decompose(mdComponent, componentName, mdConfig.objectName);
                    const result: string = await this.saveDecomposed(decomposed, mdDecomposedPath, mdConfig.objectName);
                    return result;
                }));
            processedComponents[mdType] = names;
        }));
        return processedComponents;
    }

    /**
     * Create a DecomposedEntity from a monolithic metadata component.
     * @param {object} md a monolithic metadata component parsed from a metadata file
     * @param {string} componentName the name of the component being decomposed.
     */
    private decompose(md: object, componentName: string, componentType: string): DecomposedEntity {
        const decomposed = new DecomposedEntity(componentName);
        Object.keys(Utils.OBJECT_PROPS).forEach((permissionType: string) => { // loop over each permission section name (e.g., objectPermissions)
            const objTypeFun: (perm: string) => string = Utils.OBJECT_PROPS[permissionType];
            let permissions = md[componentType][permissionType]; // gets all the permissions of a particular type as an array
            if (permissions) {
                if (!Array.isArray(permissions)) { // force it to an array, in case there was only 1
                    permissions = [permissions];
                }
                permissions.forEach(perm => {
                    const objType: string = objTypeFun(perm);
                    decomposed.putProps(permissionType, objType, perm);
                });
                delete md[componentType][permissionType];
            }
        });
        decomposed.globalProps = this.flags['no-prod'] ? Decompose.stripProps(md, componentType) : md;
        return decomposed;
    }

    /**
     * Traverses the component and saves out the groups of per-object permissions in separate files.
     * @param {DecomposedEntity} decomposed the decomposed component to be saved
     * @param {string} baseOutputPath the base path under which the separate directories and files will be created
     */
    private async saveDecomposed(decomposed: DecomposedEntity, baseOutputPath: string, componentType: string): Promise<string> {
        const componentPath: string = path.join(baseOutputPath, decomposed.componentName);
        await this.mkdir(componentPath);
        await this.serializeMetadata(`${path.join(componentPath, decomposed.componentName)}.xml`, decomposed.globalProps);
        await Promise.all(decomposed.getPropertyTypes().map(async permissionType => {
            const componentPermissionTypePath: string = path.join(componentPath, permissionType);
            await this.mkdir(componentPermissionTypePath);
            const objTypes: string[] = decomposed.getObjectsForPropertyType(permissionType);
            if (objTypes && objTypes.length) {
                await Promise.all(objTypes.map(async (objType: string) => {
                    const perms = decomposed.getProps(permissionType, objType);
                    if (perms) {
                        const wrapper: object = { [componentType]: {} };
                        wrapper[componentType][permissionType] = perms;
                        const filename = `${path.join(componentPermissionTypePath, objType)}.xml`;
                        await this.serializeMetadata(filename, wrapper);
                        return filename;
                    }
                }));
            }
        }));
        return decomposed.componentName;
    }

    /**
     * Serializes an object to an XML file.
     * @param filename the full path of the file to be written to.
     * @param metadata the metadata to be serialized.
     */
    private async serializeMetadata(filename: string, metadata: object) {
        try {
            await Utils.writeMetadata(metadata, filename);
        } catch (e) {
            throw new SfdxError(messages.getMessage('errorFileSave', [filename]));
        }
    }

    /**
     * Create a directory
     * @param dirName the full path to the new directory
     */
    private async mkdir(dirName) {
        const exists: boolean = fs.existsSync(dirName);
        if (!exists) {
            await fs.promises.mkdir(dirName);
        }
    }

}
