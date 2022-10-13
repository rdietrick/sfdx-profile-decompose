import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as util from 'util';
import * as xmlQuery from 'xml-query';
import * as xmlReader from 'xml-reader';

export default {

    // profilesDir : 'test/data/profiles',
    // decomposedDir : 'test/data/decompose/profiles/',
    // agregatedDir : 'test/__aggregated',


    initTestDataDirs : function (paths: string[]) {
        paths.forEach(element => {
            if (!fs.existsSync(element)) {
                fs.mkdirSync(element);
            }
        });
    },
    
    deleteTestData : async function (paths: string[]) {
        await Promise.all(paths.map(async (p) => {
            if (fs.existsSync(p)) {
                const rmPromise = util.promisify(rimraf);
                await rmPromise(p);
            }
        }));
    },
    
    xmlQueryFromFile : function (filename: string) {
        const f = fs.readFileSync(filename);
        const doc = xmlReader.parseSync(f.toString());
        return xmlQuery(doc);
    }
}

