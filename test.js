


const configFileProcessorGen=require('qtools-config-file-processor');

const configFileProcessor=new configFileProcessorGen({});

const config=configFileProcessor.getConfig('test.ini')




console.dir({"config [test.js.]":config});

