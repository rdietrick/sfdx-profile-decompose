sfdx-profile-decompose
======================

Decomposes profile metadata into separate, more managable files.

[![Version](https://img.shields.io/npm/v/sfdx-profile-decompose.svg)](https://npmjs.org/package/sfdx-profile-decompose)
[![CircleCI](https://circleci.com/gh/rdietrick/sfdx-profile-decompose/tree/master.svg?style=shield)](https://circleci.com/gh/rdietrick/sfdx-profile-decompose/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/rdietrick/sfdx-profile-decompose?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/sfdx-profile-decompose/branch/master)
[![Codecov](https://codecov.io/gh/rdietrick/sfdx-profile-decompose/branch/master/graph/badge.svg)](https://codecov.io/gh/rdietrick/sfdx-profile-decompose)
[![Greenkeeper](https://badges.greenkeeper.io/rdietrick/sfdx-profile-decompose.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/rdietrick/sfdx-profile-decompose/badge.svg)](https://snyk.io/test/github/rdietrick/sfdx-profile-decompose)
[![Downloads/week](https://img.shields.io/npm/dw/sfdx-profile-decompose.svg)](https://npmjs.org/package/sfdx-profile-decompose)
[![License](https://img.shields.io/npm/l/sfdx-profile-decompose.svg)](https://github.com/rdietrick/sfdx-profile-decompose/blob/master/package.json)

<!-- toc -->
* [Debugging your plugin](#debugging-your-plugin)
<!-- tocstop -->
<!-- install -->
<!-- usage -->
```sh-session
$ npm install -g sfdx-profile-decompose
$ sfdx COMMAND
running command...
$ sfdx (-v|--version|version)
sfdx-profile-decompose/0.0.1 darwin-x64 node-v12.14.1
$ sfdx --help [COMMAND]
USAGE
  $ sfdx COMMAND
...
```
* If you receive the npm error `'sfdx-profile-decompose@*' is not in the npm registry.` from the `npm install -g sfdx-profile-decompose` command then try installing with the following commands:
```
$ git clone git@github.com:rdietrick/sfdx-profile-decompose.git
$ npm install -g ./sfdx-profile-decompose
```
<!-- usagestop -->
<!-- commands -->
* [`sfdx profiles:decompose [-s <directory>] [-d <directory>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-profilesdecompose--s-directory--d-directory---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
WARN|ERROR|FATAL]`]
* [`sfdx profiles:aggregate [-s <directory>] [-d <directory>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-profilesaggregate--s-directory--d-directory---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
WARN|ERROR|FATAL]`]

## `sfdx profiles:decompose [-s <directory>] [-d <directory>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Decompose profile metadata into per-object, per-permission files.  Given a single profile metadata file at the path `force-app/main/default/profiles/Admin.xml` that contains 
`<objectPermissions>` and `<fieldPermissions>` for `Account` and `Contact` objects, you will end up with the following directory/file structure:
```
force-app/main/default/profiles/decomposed/
└── Admin
    ├── Admin.xml (core/global permissions)
    ├── fieldPermissions
    │   ├── Account.xml
    │   ├── Contact.xml
    ├── objectPermissions
    │   ├── Account.xml
    │   ├── Contact.xml
```
The `Account.xml` and `Contact.xml` files in the `fieldPermissions` and `objectPermissions` folders will contain only permissions of their respective types and objects for the Admin profle.  The `Admin.xml` file will contain all of the permissions that are not object-specific (e.g., `applicationVisiblities`, `classAccess`, etc.).

```
USAGE
  $ sfdx profiles:decompose [-s <directory>] [-d <directory>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --destination-path=destination-path                                           The path to the directory where the decomposed profile metadata where 
                                                                                    be written.  Default value is 
                                                                                    './force-app/main/default/profiles/decomposed'.

  -s, --source-path=source-path                                                     The path to the directory containing the original profile XML files.  
                                                                                    Default value is './force-app/main/default/profiles'.

  -n, --no-prod                                                                     If flagged, then production-only properties will be stripeed from 
                                                                                    decomposed XML files.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx profiles:decompose --source-path=profiles --destination-path=profiles-decomposed

```

## `sfdx profiles:aggregate [-s <directory>] [-d <directory>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Aggregate decomposed profile metadata files back into original profile XML.  Assumes the deomposed files to be in the structure documented above.

```
USAGE
  $ sfdx profiles:decompose [-s <directory>] [-d <directory>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --destination-path=destination-path                                           The path to the directory where the aggregated profile metadata will 
                                                                                    be written.  Default value is 
                                                                                    './force-app/main/default/profiles'.

  -s, --source-path=source-path                                                     The path to the directory containing the decomposed profile XML files.  
                                                                                    Default value is './force-app/main/default/profiles/decomposed'.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for this command invocation

EXAMPLES
  $ sfdx profiles:aggregate --source-path=decomposed-profiles --destination-path=profiles

```

<!-- commandsstop -->
<!-- debugging-your-plugin -->
# Debugging your plugin
We recommend using the Visual Studio Code (VS Code) IDE for your plugin development. Included in the `.vscode` directory of this plugin is a `launch.json` config file, which allows you to attach a debugger to the node process when running your commands.

To debug the `hello:org` command: 
1. Start the inspector
  
If you linked your plugin to the sfdx cli, call your command with the `dev-suspend` switch: 
```sh-session
$ sfdx hello:org -u myOrg@example.com --dev-suspend
```
  
Alternatively, to call your command using the `bin/run` script, set the `NODE_OPTIONS` environment variable to `--inspect-brk` when starting the debugger:
```sh-session
$ NODE_OPTIONS=--inspect-brk bin/run hello:org -u myOrg@example.com
```

2. Set some breakpoints in your command code
3. Click on the Debug icon in the Activity Bar on the side of VS Code to open up the Debug view.
4. In the upper left hand corner of VS Code, verify that the "Attach to Remote" launch configuration has been chosen.
5. Hit the green play button to the left of the "Attach to Remote" launch configuration window. The debugger should now be suspended on the first line of the program. 
6. Hit the green play button at the top middle of VS Code (this play button will be to the right of the play button that you clicked in step #5).
<br><img src=".images/vscodeScreenshot.png" width="480" height="278"><br>
Congrats, you are debugging!
