# qTools Config File Processor

__CONVERTS .INI FILES TO JS OBJECTS WITH SANE DATA TYPES__

Opens a .ini file and places the contents into a Javascript object _after_ converting values to valid Javascript data types as best it can. It also adds information about the .ini file.

That is, true become a boolean, not a string. 1 becomes a number, not a string.

All numbered sections and subsections are converted to arrays.

Eg,

    someListItem.0=zero
    someListItem.1=one

will be presented as

    [‘zero’, one’]

Instead of the usual .ini default,

    {‘0’:’zero’, ‘1’:’one’}

Type casting can be prevented by escaping the assignment by prefixing the value with two apostrophes. The value assigned to the variable is a string.

Eg,

    escapedValue=''0000
    typecastValue=0000

will be presented as

    typeof(escapedValue)=='string' //=>true
    console.log(escapedValue) //=> '0000'
    
    typeof(typecastValue)=='number' //=>true
    console.log(typecastValue) //=> 0

Note: Like Markdown, the .ini file is not governed by a standard and it's usage varies with the parsing library. This module uses [npm multi-ini](https://www.npmjs.com/package/multi-ini) (frozen at v2.1.2 because of possibly conflicting changes in the later version). More information can be found in the [Wikipedia](https://en.wikipedia.org/wiki/INI_file).

__SUBSTITUTES CERTAIN VALUES INTO STRINGS__

Two special values are subsituted __as strings__ into a JSON version of the
config using .qtTemplateReplace() (see [qtools-functional-library](https://www.npmjs.com/package/qtools-functional-library)) tags.

**<!userHomeDir!>** is replaced with the users home directory ($HOME, via, os.homedir()).

**<!configDir!>** is replaced with the parent directory of the configuration file being processed

For more details about substitutions, see _substitutions below.

__OPTIONAL: ASSEMBLING A CONFIGURATION INCLUDING OTHER FILES__

**TWO optional special sections ``[_mergeBefore]`` and ``[_mergeAfter]``** can contain a series of file paths to be merged into the main configuration object. The file path can either be fully qualified or a path *relative* to the directory containing the main configuration.

**_mergeAfter** files contains properties that overwrite any existing values in the main config including those from _mergeBefore and _includes (*deprecated*).

**_mergeBefore** files are merged into a JSON object in the order presented. That is later files overwrite values already present. These values are, in turn, overwritten by values from any _includes (*deprecated*) files then the main configuration and finally any _mergeAfter files (in order).

*DEPRECATED* Another optional special section ``[_includes]`` can contain a series of file paths to be merged into the main configuration object. The file path can either be fully qualified or a path relative to the directory containing the main configuration. This is deprecated because the name does not specify when the file is merged.

**Another special .ini section, ``[_substitutions]``, can be added**. Its elements are substituted __as strings__ into a JSON version of the config using .qtTemplateReplace() (see [qtools-functional-library](https://www.npmjs.com/package/qtools-functional-library)) tags, eg, <!substitutionTag!>. The _substitutions section is remains in the config. *Only use values that convert to strings* in ways that work for your application. (File path segments are a really good use.)

The _substitutions section is applied by converting the configuration object JSON (after _mergeBefore, _includes (*deprecated*) and _mergeAfter are applied) and then replacing the substitution tags with values from the _substitutions section.

Eg,

    [testSection]
    <!prefix!>_Name=<!someValue!>
    
    [_substitutions]
    prefix=HELLO
    someValue=This is a test!

will be presented as

    console.log(testSection.HELLO_Name); //=> 'This is a test'

**Substitution processing is applied twice**. This allows substitution tags to be used in substitution tags but only to one level.

Eg,

    [testSection]
    greeting=<!doubleSub!>
    
    [_substitutions]
    pleasantry=HELLO
    doubleSub=<!pleasantry!> World!!

will be presented as

    console.log(testSection.greeting); //=> 'HELLO World!!'

__OPTIONAL: CONFIG LOCATION SEARCH__

**getConfig() also takes a optional second parameter**, workingDirectory. In this case, the first parameter is the name of a configuration file that is sought in the directory tree starting with the specified directory and working up.

**getConfig() can take a third parameter**, options, with these properties:

**`resolve`**    when set to true, the program logs the file paths tried in locating a configuration file.

__OPTIONAL: RUNTIME CONFIGURATION MODIFICATIONS__

**`injectedItems`** This object is added (*not* merged) to the configuration as a new property, 'injectedItems'.

**`userSubstitutions`** These are applied in the same way as _substitutions elements in the .ini file. These are applied to the stringified version of the fully merged object *before* the substitutions in the file. Consequently, they can be used to replace replacement tags in the _substitution section of the main config. Eg, 

`configFileContentsString.replace('<!remoteBasePath!>', '<!prodRemoteBasePath!>')`.

By the time _substitutions is processed, all references to remoteBasePath have been changed to prodRemoteBasePath and that is substituted into the final JS config object.

_I use it like this:_

>        if (options.useProdPath) {
>            configOptions = {
>                userSubstitutions: {
>                    remoteBasePath: '<!prodRemoteBasePath!>'
>                }
>            };
>        }

__DEBUGGING HELP IS PLACED IN THE__ _meta __PROPERTY__

**A section named _meta is injected** into the config that identifies the source file and change date (see below) and other stuff that helps debug problems.

For example…

    const configFileProcessorGen=require('qtools-config-file-processor');
    const configFileProcessor=new configFileProcessorGen();
    
    const config=configFileProcessor.getConfig('/Path/to/test.ini')
    
    console.dir({"config [test.js.]":config});

Produces…

>    {
> 
>        meta: {
>            configurationSourceFilePath: '/Path/to/test.ini',
>            configurationModificationDate: '6/15/2020, 5:38:55 PM'
>            _substitutions:{},
>            _mergeBefore:['filepatha', 'filepathb'],
>            _includes:['filepath1', 'filepath2'],
>            _mergeAfter:['filepathx', 'filepathy'],
>            injectedItems:{},
>            userSubstitutions:{}
>        },
>     
>        system: { hello: 'goodbye' },
>        sectionOne: { animal: 'fish', someList: [Array] },
>        arrayItems: { placeholderKey1: 'sectionOne.someList' }
> 
>    }

__CHANGE LOG__

v1.0.16 - no functional changes. Verified correct processing of merge and substitute, applied code formatting and added comments.

v1.0.17 - no functional changes. README changes only.
