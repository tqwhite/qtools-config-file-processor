# qTools Config File Processor

Opens a .ini file and places it’s contents into a Javascript object _after_ converting values as best it can. It also adds information about the .ini file.

That is, true become a boolean, not a string. 1 becomes a number, not a string.

A special .ini section can be added, arrayItems, that lists dotted paths to elements that should be converted  to Array.

Eg,

    someListItem.0=zero
    someListItem.1=one

will be presented as

    [‘zero’, one’]

Instead of the default,

    {‘0’:’zero’, ‘1’:’one’}

For example…

    
    const configFileProcessorGen=require('qtools-config-file-processor');
    const configFileProcessor=new configFileProcessorGen();
    
    const config=configFileProcessor.getConfig('/Path/to/test.ini')
    
    
    console.dir({"config [test.js.]":config});
    

Produces…

   
    {
        configurationSourceFilePath: '/Path/to/test.ini',
        configurationModificationDate: '6/15/2020, 5:38:55 PM',
        system: { hello: 'goodbye' },
        sectionOne: { animal: 'fish', someList: [Array] },
        arrayItems: { placeholderKey1: 'sectionOne.someList' }
    }