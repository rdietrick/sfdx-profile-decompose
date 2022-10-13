import * as xmlParser from 'fast-xml-parser';
import * as fs from 'fs';

export default class Utils {

    public static DEFAULT_SOURCE_PATH = './force-app/main/default';
    public static DEFAULT_DECOMPOSE_DIR = 'decomposed';

    public static MD_TYPE_CONFIGS = {
        profiles: {
            objectName: 'Profile',
            mdSuffix: '.profile-meta.xml'
        },
        permissionsets: {
            objectName: 'PermissionSet',
            mdSuffix: '.permissionset-meta.xml'
        }
    };

    // define the per-object profile metadata properties that we will decompose
    // and the function to retrieve the custom/standard object type for a parsed property instance
    public static OBJECT_PROPS = {
        fieldPermissions : obj => obj.field.split('.')[0], // returns 'Account' from a parsed <field>Account.AccountNumber</field>
        layoutAssignments : obj => obj.layout.split('-')[0], // returns 'Account' from a parsed <layout>Account-Account Layout</layout>
        objectPermissions : obj => obj.object, // returns 'Account' from a parsed <object>Account</object>
        recordTypeVisibilities : obj => obj.recordType.split('.')[0] // returns 'Account' from a parsed <recordType>Account.Standard</recordType>
    };

    public static STRIP_PROPS = {
        applicationVisibilities : [
            { application: 'standard__LightningInstrumentation'}
        ],
        userPermissions : [
            { name: 'ManageSandboxes'},
            { name: 'EditBillingInfo'},
            { name: 'Packaging2PromoteVersion'}
        ]
    };

    /**
     * Serializes the metadata object to XML and writes it to the specified file.
     * @param mdObject the metadata object to be serialized
     * @param filename (full) name of the file to write to
     * @param transformer an optional transformer function executed on the serialized data before writing to file
     */
    public static async writeMetadata(mdObject: object, filename: string, transformer?: (s: string) => string): Promise<string> {
        let fileContents: string = '';
        const parser = new xmlParser.j2xParser({format: true, indentBy: '    '});
        fileContents =  parser.parse(mdObject);
        if (transformer) {
            fileContents = transformer(fileContents);
        }
        await fs.promises.writeFile(filename, fileContents);
        return filename;
    }

}
