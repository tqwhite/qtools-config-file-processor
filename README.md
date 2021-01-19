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


A special .ini section, ``_substitutions``, can be added, substitutions,
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
    

A section named _meta is injected into the config that identifies the 
source file and change date (see below).

For example…

    
    const configFileProcessorGen=require('qtools-config-file-processor');
    const configFileProcessor=new configFileProcessorGen();
    
    const config=configFileProcessor.getConfig('/Path/to/test.ini')
    
    
    console.dir({"config [test.js.]":config});
    

Produces…

   
	{
		_meta: {
			configurationSourceFilePath: '/Path/to/test.ini',
			configurationModificationDate: '6/15/2020, 5:38:55 PM'
		},
		system: { hello: 'goodbye' },
		sectionOne: { animal: 'fish', someList: [Array] },
		arrayItems: { placeholderKey1: 'sectionOne.someList' }
	}
