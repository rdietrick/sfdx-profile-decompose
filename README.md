sfdx-profile-decompose
======================

Decomposes profile metadata into separate, more managable files.

[![Version](https://img.shields.io/npm/v/sfdx-profile-decompose.svg)](https://npmjs.org/package/sfdx-profile-decompose)
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
### Installing

```sh-session
$ npm install -g @rdietrick/sfdx-profile-decompose
```
* If you receive the npm error `'sfdx-profile-decompose@*' is not in the npm registry.` from the `npm install -g sfdx-profile-decompose` command then try installing with the following commands:
```
$ git clone git@github.com:rdietrick/sfdx-profile-decompose.git
$ npm install -g ./sfdx-profile-decompose
```

<!-- commands -->
* [`sfdx profiles:aggregate [-s <directory>] [-d <string>] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-profilesaggregate--s-directory--d-string--m-array---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx profiles:decompose [-s <directory>] [-d <string>] [-n] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-profilesdecompose--s-directory--d-string--n--m-array---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx profiles:aggregate [-s <directory>] [-d <string>] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Aggregates decomposed profiles back into monolithic metadata files.

```
USAGE
  $ sfdx profiles:aggregate [-s <directory>] [-d <string>] [-m <array>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --decompose-dir=decompose-dir                                                 [default: decomposed] The name of
                                                                                    the directory where decomposed
                                                                                    metadata files reside.

  -m, --md-types=md-types                                                           [default: profiles,permissionsets]
                                                                                    Comma-separated list of metadata
                                                                                    types to decompose (can only include
                                                                                    'profiles' and 'permnissionsets').

  -s, --source-path=source-path                                                     [default: ./force-app/main/default]
                                                                                    The path to the directory containing
                                                                                    the the decomposed metadata files.
                                                                                    Default value is './force-app/main/d
                                                                                    efault/profiles/decomposed'.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx profiles:aggregate --source-path=path/to/source --decompose-dir=decomposed
```

_See code: [src/commands/profiles/aggregate.ts](https://github.com/rdietrick/sfdx-profile-decompose/blob/v1.0.2/src/commands/profiles/aggregate.ts)_

## `sfdx profiles:decompose [-s <directory>] [-d <string>] [-n] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Decomposes monolithic profile metadata files into smaller, more manageable units with less likelihood of conflicts in your source control repository.

```
USAGE
  $ sfdx profiles:decompose [-s <directory>] [-d <string>] [-n] [-m <array>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --decompose-dir=decompose-dir                                                 [default: decomposed] The name of
                                                                                    the directory where decomposed
                                                                                    metadata files reside.

  -m, --md-types=md-types                                                           [default: profiles,permissionsets]
                                                                                    Comma-separated list of metadata
                                                                                    types to decompose (can only include
                                                                                    'profiles' and 'permnissionsets').

  -n, --no-prod                                                                     If present/true, production-only
                                                                                    profile permissions will be stripped
                                                                                    from the decomposed profile files.

  -s, --source-path=source-path                                                     [default: ./force-app/main/default]
                                                                                    The path to the directory containing
                                                                                    the original profile XML files.
                                                                                    Default value is
                                                                                    './force-app/main/default/profiles'.

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed
  $ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed --no-prod
  $ sfdx profiles:decompose --source-path=path/to/source --decompose-dir=decomposed --md-types=profiles
```

_See code: [src/commands/profiles/decompose.ts](https://github.com/rdietrick/sfdx-profile-decompose/blob/v1.0.2/src/commands/profiles/decompose.ts)_
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
