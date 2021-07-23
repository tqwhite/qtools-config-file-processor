# qTools Config File Processor

Opens a .ini file and places it’s contents into a Javascript object
_after_ converting values as best it can. It also adds information about
the .ini file.

That is, true become a boolean, not a string. 1 becomes a number, not a
string.

All numbered sections and subsections are converted to arrays.

Eg,

    someListItem.0=zero
    someListItem.1=one

will be presented as

    [‘zero’, one’]

Instead of the default,

    {‘0’:’zero’, ‘1’:’one’}


**A special .ini section, ``_substitutions``, can be added**, substitutions,
whose elements are substituted __as strings__ into a JSON version of the
config using .qtTemplateReplace() tags, eg, <!substitutionTag!>. The
_substitutions section is left in the config. Only use values that
convert to strings in ways that work for your application. (File path
segments are really good.)

Eg,
	
	[testSection]
    <!prefix!>_Name=<!someValue!>
    
    [_substitutions]
    prefix=HELLO
    someValue=This is a test!

will be presented as

    console.log(testSection.HELLO_Name); //=> 'This is a test'

**Another optional special section [_includes]** can contain a series of file paths to be merged
into the main configuration object. The file path can either be fully qualified or 
a path relative to the directory containing the main configuration.


getConfig() also takes a optional second parameter, workingDirectory. 
In this case, the first parameter is the name of a configuration file 
that is sought in the directory tree starting with the specified directory 
and working up.



**getConfig() can take a third parameter**, options, with these properties:

**`resolve`**	when set to true, the program logs the file paths tried in locating a configuration file.

**`injectedItems`** This object is added to the configuration as a new property, 'injectedItems'.

**`userSubstitutions`**	These are applied in the same way as _substitutions elements in the .ini 
file. They are applied **as strings** first and, consequently, can be used to modify
the application of _substitutions.

**userSubstitutions causes** getConfigs() to do, eg, `configFileContentsString.replace('<!remoteBasePath!>', '<!prodRemoteBasePath!>')`.
When _substitutions is processed, all references to remoteBasePath have been revised and result in the config
being returned with paths that point at production.

_I use it like this:_

>		if (options.useProdPath) {
>			configOptions = {
>				userSubstitutions: {
>					remoteBasePath: '<!prodRemoteBasePath!>'
>				}
>			};
>		}



**A section named _meta is injected** into the config that identifies the 
source file and change date (see below) and other stuff that helps debug problems.

For example…

    
    const configFileProcessorGen=require('qtools-config-file-processor');
    const configFileProcessor=new configFileProcessorGen();
    
    const config=configFileProcessor.getConfig('/Path/to/test.ini')
    
    console.dir({"config [test.js.]":config});
    

Produces…


>	{
>
>		meta: {
>			configurationSourceFilePath: '/Path/to/test.ini',
>			configurationModificationDate: '6/15/2020, 5:38:55 PM'
>			_substitutions:{},
>			_includes:['filepath1', 'filepath2'],
>			injectedItems:{},
>			userSubstitutions:{}
>		},
>		
>		system: { hello: 'goodbye' },
>		sectionOne: { animal: 'fish', someList: [Array] },
>		arrayItems: { placeholderKey1: 'sectionOne.someList' }
>	}



