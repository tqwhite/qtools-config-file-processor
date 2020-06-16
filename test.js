


const configFileProcessorGen=require('qtools-config-file-processor');

const configFileProcessor=new configFileProcessorGen({});

const config=configFileProcessor.getConfig('/Users/tqwhite/Scripts/bin/js/sampleApp/service/code/node_modules/qtools-config-file-processor/test.ini')




console.dir({"config [test.js.]":config});

