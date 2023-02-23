import { expect, test } from '@salesforce/command/lib/test';
import * as fs from 'fs';
import * as path from 'path';
import * as xmlQuery from 'xml-query';
import testUtils from '../../utils';
import utils from '../../../src/lib/utils';

describe("profiles:decompose", () => {
    const sourceDir = path.join('test','data', 'decompose');
    const decomposeDirs = Object.keys(utils.MD_TYPE_CONFIGS).map(mdType => path.join(sourceDir, mdType, 'decomposed'));

    beforeEach(() => {
        testUtils.initTestDataDirs(decomposeDirs);
    });
    afterEach(async () => {
        await testUtils.deleteTestData(decomposeDirs);
    });
   
    const cmdArgs = [
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'profiles'];

    test
    .command(cmdArgs)
    .it('creates core profile XML', ctx => {
        expect(fs.existsSync(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'))).to.be.true;
    });

    test
    .command(cmdArgs)
    .it('decomposes multiple profiles', ctx => {
        expect(fs.existsSync(path.join(sourceDir, 'profiles', 'decomposed', 'Other', 'Other.xml'))).to.be.true;
    });

    test
    .stdout()
    .command(cmdArgs.concat(['--json']))
    .it('logs decomposed profile names', ctx => {
      expect(ctx.stdout).to.contain('Admin').and.to.contain('Other');
    });

    test
    .command(cmdArgs)
    .it('creates separate files for object-level permissions', ctx => {
        const filesExist = [
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Account.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Contact.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Customer_Engagement__c.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'layoutAssignments', 'Account.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'layoutAssignments', 'Customer_Engagement__c.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'objectPermissions', 'Account.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'objectPermissions', 'Contact.xml'),
            path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'recordTypeVisibilities', 'Account.xml')
        ].map(f => fs.existsSync(f));
        expect(filesExist).to.have.length(8);
        expect(filesExist).not.to.contain(false);
    });

    test
    .command(cmdArgs)
    .it('core profile contains all generic properties', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'));
        expect(xq.find('applicationVisibilities')).to.have.length(2);
        expect(xq.find('classAccesses')).to.have.length(2);
        expect(xq.find('custom')).to.have.length(1);
    });

    test
    .command(cmdArgs)
    .it('core profile has no object-specific props', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'));
        expect(xq.find('fieldPermissions')).to.have.length(0);
        expect(xq.find('layoutAssignments')).to.have.length(0);
        expect(xq.find('objectPermissions')).to.have.length(0);
        expect(xq.find('recordTypeVisibilities')).to.have.length(0);
    });

    test
    .command(cmdArgs)
    .it('handles single object-specific prop', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Account.xml'));
        expect(xq.find('fieldPermissions')).to.have.length(1);
    });

    test
    .command(cmdArgs)
    .it('handles mnultiple object-specific props', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Contact.xml'));
        expect(xq.find('fieldPermissions')).to.have.length(2);
    });

    test
    .command(cmdArgs)
    .it('handles custom object props', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Customer_Engagement__c.xml'));
        expect(xq.find('fieldPermissions')).to.have.length(1);
    });

    test
    .command(cmdArgs)
    .it('handles __c properties', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'fieldPermissions', 'Contact.xml'));
        const fieldPerm = xmlQuery(xq.find('fieldPermissions').get(1)).find('field');
        expect(fieldPerm.text()).to.eq('Contact.GitHub_Handle__c');
    });

    test
    .stderr()
    .command(['profiles:decompose', '--source-path', './doesntexist/definitelydoesntexist', '--decompose-dir', 'decomposed'])
    .it('throws an error if the source-path doesn\'t exist', ctx => {
        expect(ctx.stderr).to.contain('not found');
    });

    test
    .stderr()
    .command(['profiles:decompose', '--source-path', sourceDir, '--decompose-dir', 'idontexist'])
    .it('throws an error if the decompose-dir does not exist', ctx => {
        expect(ctx.stderr).to.contain('not found');
    });

    test
    .command(cmdArgs)
    .it('handles empty permission sections', ctx => {
        expect(fs.existsSync(path.join(...'decomposed/Other/recordTypeVisibilities'))).to.be.false;
    });

    test
    .command(cmdArgs)
    .it('strips properties', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'));
        const appPerms = xq.find('applicationVisibilities');
        expect(appPerms).to.have.length(2);
        appPerms.each(perm => {
            const app = xmlQuery(perm).find('application').text();
            expect(app).not.to.eq('standard__LightningInstrumentation');
        });
    });

    test
    .command(cmdArgs)
    .it('strips multiple properties of a single type', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'));
        const appPerms = xq.find('userPermissions');
        expect(appPerms).to.have.length(2);
    });

    test
    .command(['profiles:decompose', '--source-path', sourceDir, '--decompose-dir', 'decomposed', '--md-types', 'profiles'])
    .it('doesn\'t strip when --no-prod = false', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'));
        const appPerms = xq.find('applicationVisibilities');
        const app = xmlQuery(appPerms.get(2)).find('application').text();
        expect(app).to.eq('standard__LightningInstrumentation');
        expect(appPerms).to.have.length(3);
    });

    test
    .command([
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'permissionsets'])
    .it('decomposes permissionsets', ctx => {
        expect(fs.existsSync(path.join(sourceDir, 'permissionsets', 'decomposed', 'Author_Apex', 'Author_Apex.xml'))).to.be.true;
    });

    test
    .command([
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'permissionsets,profiles'])
    .it('decomposes profiles and permissionsets', ctx => {
        expect(fs.existsSync(path.join(sourceDir, 'permissionsets', 'decomposed', 'Author_Apex', 'Author_Apex.xml'))).to.be.true;
        expect(fs.existsSync(path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml'))).to.be.true;
    });

    test
    .command([
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'permissionsets'])
    .it('decomposes multiple permissionsets', ctx => {
        expect(fs.existsSync(path.join(sourceDir, 'permissionsets', 'decomposed', 'Author_Apex', 'Author_Apex.xml'))).to.be.true;
        expect(fs.existsSync(path.join(sourceDir, 'permissionsets', 'decomposed', 'Services_Delivery_App_User', 'Services_Delivery_App_User.xml'))).to.be.true;
    });
    
    test
    .command([
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'permissionsets'])
    .it('decomposes permissionset object props', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'permissionsets', 'decomposed', 'Services_Delivery_App_User', 'fieldPermissions', 'Account.xml'));
        expect(xq.find('fieldPermissions')).to.have.length(1);
    });

    test
    .command([
        'profiles:decompose', 
        '--source-path',  sourceDir, 
        '--decompose-dir', 'decomposed', 
        '--no-prod',
        '--md-types', 'permissionsets'])
    .it('strips prod properties from permissionsets', ctx => {
        const xq = testUtils.xmlQueryFromFile(path.join(sourceDir, 'permissionsets', 'decomposed', 'Services_Delivery_App_User', 'Services_Delivery_App_User.xml'));
        expect(xq.find('applicationVisibilities')).to.have.length(1);
    });

    test
    .command([
        'profiles:decompose',
        '--source-path',  sourceDir,
        '--decompose-dir', 'decomposed',
        '--no-prod',
        '--md-types', 'profiles',
        '--separate-classes'])
    .it('separates classAccesses', ctx => {
        const adminProfilePath = path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'Admin.xml');
        expect(fs.existsSync(adminProfilePath)).to.be.true;
        let xq =  testUtils.xmlQueryFromFile(adminProfilePath);
        expect(xq.has('classAccesses')).to.be.false;

        const classAccessesPath = path.join(sourceDir, 'profiles', 'decomposed', 'Admin', 'classAccesses.xml');
        expect(fs.existsSync(classAccessesPath)).to.be.true;

        xq = testUtils.xmlQueryFromFile(classAccessesPath);
        const classAccesses = xq.find('classAccesses');
        expect(classAccesses).to.have.length(2);
    });
});