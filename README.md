sfdx-profile-decompose
======================

An SFDX plugin that decomposes profile and permissionset metadata into separate, more managable files.  The plugin is also capable of restoring profile/permissionset metadata back into the monolithic format expected by SFDC deployment tools.

Instead of one giant file for each profile or permissionset, you can track such metadata in your repo/project in more granular, object-specific files.  For instance, a monolithic Admin.xml profile could be broken down into the following structure:
```
force-app/main/default/profiles/decomposed/Admin
├── Admin.xml
├── fieldPermissions
│   ├── Account.xml
│   ├── Contact.xml
│   ├── Lead.xml
│   ├── Opportunity.xml
├── layoutAssignments
│   ├── Account.xml
│   ├── Contact.xml
│   ├── Lead.xml
│   ├── Opportunity.xml
├── objectPermissions
│   ├── Account.xml
│   ├── Contact.xml
│   ├── Lead.xml
│   ├── Opportunity.xml
└── recordTypeVisibilities
│   ├── Account.xml
│   ├── Contact.xml
│   ├── Lead.xml
│   ├── Opportunity.xml
```

The Admin.xml file in the root profile directory will contain system-level permissions, while the object-specific files will contain the profile permissions that pertain to that specific object's metadata.

<!-- install -->
### Installing

The easiest way to install this plugin (assuming you have the [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) installed) is to simply run:
```sh-session
$ sfdx plugins:install @rdietrick/sfdx-profile-decompose
```

You can also clone this repo and install this as an npm module with the following commands:
```
$ git clone git@github.com:rdietrick/sfdx-profile-decompose.git
$ npm install -g ./sfdx-profile-decompose
```

<!-- commands -->
### Commands

There are two commands available in this plugin, which are documented in detail below.  They are:

* `sfdx profiles:aggregate` - aggregates granular profile/permissionset files into the monolithic format expected during deployment
* `sfdx profiles:decompose` - decomposes monolithic profile/permissionset files into more granular, object-specific files

#### `sfdx profiles:aggregate [-s <directory>] [-d <string>] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

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


#### `sfdx profiles:decompose [-s <directory>] [-d <string>] [-n] [-m <array>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

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

