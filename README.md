sfdx-profile-decompose
======================

Decomposes profile metadata into separate, more managable files.


<!-- install -->
### Installing

```sh-session
$ npx sf plugins:install @rdietrick/sfdx-profile-decompose
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

