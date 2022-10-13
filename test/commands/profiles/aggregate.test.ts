import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import * as path from 'path';
import testUtils from '../../utils';

const sourcePath = path.join('test','data', 'aggregate');
const decomposeDir = 'decomposed';

const decomposeCmdArgs = ['profiles:decompose', '--source-path', sourcePath, '--decompose-dir', decomposeDir, '--no-prod', '--md-types', 'profiles'];
const aggregateCommandArgs = ['profiles:aggregate', '--source-path', sourcePath, '--decompose-dir', decomposeDir, '--md-types', 'profiles'];

const aggregatedFile = path.join(sourcePath, 'profiles', 'Admin.profile-meta.xml');

describe('profiles:aggregate', () => {

    const badFilePath = path.join(sourcePath, 'profiles', decomposeDir, 'Bad');

    beforeEach(() => {
        fs.mkdirSync(badFilePath);
        console.log(`writing bad XML to ${path.join(badFilePath, 'Bad.xml')}`);
        fs.writeFileSync(path.join(badFilePath, 'Bad.xml'), '<Profile><sometag>text<someothertag/></Profile>');
    });
    afterEach(async () => {
        await testUtils.deleteTestData([badFilePath]);
    });

    test
    .stderr()
    .command(aggregateCommandArgs)
    .it('throws an error if it can\'t parse XML', ctx => {
        expect(ctx.stderr).to.contain('Failed to read or parse decomposed profile metadata');
    });

});

describe('profiles:aggregate', () => {
    afterEach(async () => {
        await testUtils.deleteTestData([aggregatedFile, path.join(sourcePath, 'profiles', 'Other.profile-meta.xml')]);
        await testUtils.deleteTestData([aggregatedFile, path.join(sourcePath, 'permissionsets', 'Services_Delivery_App_User.permissionset-meta.xml')]);
    });

    test
    .command(decomposeCmdArgs)
    .command(aggregateCommandArgs)
    .it('creates aggregated profile XML', ctx => {
        expect(fs.existsSync(aggregatedFile)).to.be.true;
    });

    test
    .command(decomposeCmdArgs)
    .command(aggregateCommandArgs)
    .it('handles multiple profiles', ctx => {
        expect(fs.existsSync(path.join(sourcePath, 'profiles', 'Other.profile-meta.xml'))).to.be.true;
    });

    test
    .command(decomposeCmdArgs)
    .command(aggregateCommandArgs)
    .it('handles empty permnission sections', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourcePath, 'profiles', 'Other.profile-meta.xml'));
        expect(xq.find('recordTypeVisibilities')).to.have.length(0);
    });

    test
    .command(decomposeCmdArgs)
    .command(aggregateCommandArgs)
    .it('includes core permissions', ctx => {
        const xq = testUtils.xmlQueryFromFile(aggregatedFile);
        expect(xq.find('applicationVisibilities')).to.have.length(2);
        expect(xq.find('classAccesses')).to.have.length(2);
        expect(xq.find('custom')).to.have.length(1);
    });

    test
    .command(decomposeCmdArgs)
    .command(aggregateCommandArgs)
    .it('includes all object permissions', ctx => {
        const xq = testUtils.xmlQueryFromFile(aggregatedFile);
        expect(xq.find('fieldPermissions')).to.have.length(4);
        expect(xq.find('layoutAssignments')).to.have.length(3);
        expect(xq.find('objectPermissions')).to.have.length(2);
        expect(xq.find('recordTypeVisibilities')).to.have.length(1);
    });

    test
    .stderr()
    .command(['profiles:aggregate', '--source-path', './doesntexist/definitelydoesntexist', '--decompose-dir', 'decomposed'])
    .it('throws an error if the source-path doesn\'t exist', ctx => {
        expect(ctx.stderr).to.contain('not found');
    });

    test
    .stderr()
    .command(['profiles:aggregate', '--source-path', sourcePath, '--decompose-dir', 'doesntexist', '--md-types', 'profiles'])
    .it('throws an error if the decompose-dir doesn\'t exist', ctx => {
        expect(ctx.stderr).to.contain('not found');
    });

    test
    .command(['profiles:aggregate', '--source-path', sourcePath, '--decompose-dir', decomposeDir, '--md-types', 'permissionsets'])
    .it('aggregates permissionsets', ctx => {
        expect(fs.existsSync(path.join(sourcePath, 'permissionsets', 'Services_Delivery_App_User.permissionset-meta.xml'))).to.be.true;
    });

    test
    .command(['profiles:aggregate', '--source-path', sourcePath, '--decompose-dir', decomposeDir, '--md-types', 'permissionsets'])
    .it('aggregates fieldPermissions into permissionsets', ctx => {
        const permSet = path.join(sourcePath, 'permissionsets', 'Services_Delivery_App_User.permissionset-meta.xml');
        const xq = testUtils.xmlQueryFromFile(permSet);
        expect(xq.find('fieldPermissions')).to.have.length(4);

    });

});
