 
const configFileProcessor = require('qtools-config-file-processor');

const config = configFileProcessor.getConfig(
	'test.ini'
);   
 config.qtDump({ label: 'config' }); 

