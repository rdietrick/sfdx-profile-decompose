import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as xmlParser from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import Utils from '../../lib/utils';

// Initialize Messages with the current plugin directory
// console.log(`__dirname = ${__dirname}`);
Messages.importMessagesDirectory(__dirname, true, 'sfdx-profile-decompose');

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-profile-decompose', 'aggregate');

/**
 * CLI command which re-bundles decomposed metadata files back
 * into their original (monolithic) format.  Expects the decomposed files
 * to be in the format output by the `profiles:decompose` command.
 */
export default class Aggregate extends SfdxCommand {

    public static description: string = messages.getMessage('commandDescription');
    public static examples = [
        '$ sfdx profiles:aggregate --source-path=path/to/source --decompose-dir=decomposed'
    ];

    public static args = [];
    protected static flagsConfig = {
        'source-path': flags.directory({ char: 's', description: messages.getMessage('sourcePathFlagDescription'), default: Utils.DEFAULT_SOURCE_PATH }),
        'decompose-dir': flags.string({ char: 'd', description: messages.getMessage('decomposeDirFlagDescription'), default: Utils.DEFAULT_DECOMPOSE_DIR }),
        'md-types': flags.array({char: 'm', description: messages.getMessage('metadataTypesFlagDescription'), default: ['profiles', 'permissionsets']})
    };

    // Comment this out if your command does not require an org username
    protected static requiresUsername = false;

    // Comment this out if your command does not support a hub org username
    protected static supportsDevhubUsername = false;

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = false;

    protected static PARSER_OPTS = {};

    /**
     * Execute the command.
     */
    public async run(): Promise<AnyJson> {
        const sourcePath = this.flags['source-path'] || Utils.DEFAULT_SOURCE_PATH;
        if (!fs.existsSync(sourcePath)) {
            throw new SfdxError(messages.getMessage('errorSourcePathNotFound', [sourcePath]));
        }
        const decomposeDir = this.flags['decompose-dir'] || Utils.DEFAULT_DECOMPOSE_DIR;

        const mdTypes = this.flags['md-types'];
        const processedComponents = {};
		await Promise.all(mdTypes.map(async mdType => {
			const mdSourcePath = path.join(sourcePath, mdType);
			const mdDecomposedPath = path.join(mdSourcePath, decomposeDir);
			if (!fs.existsSync(mdDecomposedPath)) {
				throw new SfdxError(messages.getMessage('errorDecomposeDirNotFound', [mdDecomposedPath]));
			}
			const componentConfig = Utils.MD_TYPE_CONFIGS[mdType];
			const suffix = componentConfig['mdSuffix'];

			let names: string[] = [];
			const mdDirs: fs.Dirent[] = await fs.promises.readdir(mdDecomposedPath, { withFileTypes: true });
			if (mdDirs && mdDirs.length) {
				names = await Promise.all(mdDirs.filter(f => !f.name.startsWith('.') && f.isDirectory()).map(async dirent => {
					const componentName: string = dirent.name;
					const mdComponent = await this.aggregateComponent(componentName, path.join(mdDecomposedPath, dirent.name), componentConfig['objectName']);
					await this.saveAggregatedComponent(mdComponent, componentConfig['objectName'], `${path.join(mdSourcePath, componentName)}${suffix}`);
					return componentName;
				}));
			}
			processedComponents[mdType] = names;
		}));
        
        return processedComponents;
    }

    private async saveAggregatedComponent(mdComponent: object, componentType: string, filename: string) {
        // need to prepend the XML tag and add the xmlns attribute to the root object
        const xmlPrepender = (input: string) => {
            let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
            output += input.replace(`<${componentType}>`, `<${componentType} xmlns="http://soap.sforce.com/2006/04/metadata">`);
            return output;
        };
        try {
            await Utils.writeMetadata(mdComponent, filename, xmlPrepender);
        } catch (e) {
            throw new SfdxError(messages.getMessage('errorFileSave', [filename]));
        }
    }

    /**
     * Reads all decomposed metadata XML files and reconstructs the original metadata from them.
     * @param componentName the name of the metadata component
     * @param componentPath the path to the root of the component's XML files.
     */
    private async aggregateComponent(componentName: string, componentPath: string, componentType: string): Promise<object> {
        const coreMdFile = `${componentPath}/${componentName}.xml`;
		// console.log(`Parsing metadata from file ${coreMdFile}`);
		const parsedMd = await this.readAndParseMetadata(coreMdFile);
		await Promise.all(Object.keys(Utils.OBJECT_PROPS).map(async propertyType => {
			// loop over each property type (e.g., 'fieldPermissions') and aggregate the properties from each
			// object's XML file into a single array of properties
			const permTypePath = path.join(componentPath, propertyType);
			if (fs.existsSync(permTypePath)) {
				const objectPermFiles: fs.Dirent[] = await fs.promises.readdir(permTypePath, { withFileTypes: true });
				parsedMd[componentType][propertyType] = [];
				const objectPerms: object[] = await Promise.all(objectPermFiles.filter(f => f.isFile() && f.name.toLowerCase().endsWith('.xml'))
					.map(async permFile => {
						const perms = await this.readAndParseMetadata(path.join(permTypePath, permFile.name));
						return perms[componentType][propertyType];
					}));
				parsedMd[componentType][propertyType] = parsedMd[componentType][propertyType].concat(objectPerms.reduce((acc: object[], val) => acc.concat(val), []));
				// parsedMd[componentType][propertyType].push.apply(parsedMd[componentType][propertyType], objectPerms.reduce((acc: object[], val) => acc.concat(val), []));
			}
		}));
		return parsedMd;

	}

    /**
     * Reads component metadata from a file and parses it into an object.
     * @param mdPath the location of the XML file to be read
     */
    private async readAndParseMetadata(mdPath: string): Promise<object> {
        let mdComponent: object = null;
        try {
            const buffer = await fs.promises.readFile(mdPath);
            const contents = buffer.toString('utf-8');
            if (xmlParser.validate(contents) === true) {
                mdComponent = xmlParser.parse(contents);
            }
        } catch (err) {
            // exception will be thrown below
        }
        if (!mdComponent) {
			throw new SfdxError(messages.getMessage('errorXmlParse', [`Parsing ${mdPath} failed.`]));
        }
        return mdComponent;
    }
}
