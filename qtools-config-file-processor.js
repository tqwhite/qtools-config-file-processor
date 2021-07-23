'use strict';

const multiIni = require('multi-ini');
const fs = require('fs');
const path = require('path');
var qtLib = require('qtools-functional-library');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args = {}) {
	const { logger = {} } = args;

	logger.warn = logger.warn
		? logger.warn
		: message => console.log(`WARNING: ${message}`);
	logger.error = logger.error
		? logger.error
		: message => console.log(`ERROR: ${message}`);

	const findGoodConfigPath = (pathParm, workingDirectory, resolve) => {
		let result = fs.existsSync(pathParm) ? fs.realpathSync(pathParm) : '';
		workingDirectory = workingDirectory
			? fs.realpathSync(workingDirectory)
			: '';
		if (result) {
			return result;
		} else if (workingDirectory) {
			while (
				workingDirectory != '/' &&
				!fs.existsSync(path.join(workingDirectory, pathParm))
			) {
				if (resolve) {
					logger.warn(`tried: ${path.join(workingDirectory, pathParm)}`);
				}
				workingDirectory = path.dirname(workingDirectory);
			}
			const result =
				workingDirectory != '/' ? path.join(workingDirectory, pathParm) : '';
			if (resolve) {
				logger.warn(`finished with: ${result}`);
			}
			return result;
		}

		return result;
	};

	const multiIniGen = require('multi-ini');
	const multiIni = new multiIniGen.Class({
		filters: [
			value => {
				if (value == /^''$/) {
					return value;
				}

				if (value.match(/^''/)) {
					return value.replace(/^''/, '');
				}

				switch (value) {
					case 'true':
						return true;
					case 'false':
						return false;
					case 'null':
						return null;
				}

				if (!isNaN(+value)) {
					return +value;
				}

				return value;
			}
		]
	});

	this.getConfig = (configPath, workingDirectory, options = {}) => {
		const { resolve = false, userSubstitutions, injectedItems } = options;
		if (!workingDirectory) {
			workingDirectory = '.';
		}
		const configurationSourceFilePath = findGoodConfigPath(
			configPath,
			workingDirectory,
			resolve
		);
		if (!configurationSourceFilePath) {
			logger.error(`no config file found ${configPath}`);
			return;
		}

		const configurationModificationDate = fs
			.statSync(configurationSourceFilePath)
			.mtime.toLocaleString();

		let config = multiIni
			.read(configurationSourceFilePath)
			.qtNumberKeysToArray()
			.qtMerge({
				_meta: {
					configurationSourceFilePath,
					configurationModificationDate
				}
			});

		const configString = JSON.stringify(config);
		const includedFiles=[];

		if (config._includes && config._includes.length) {
			const appendages = config._includes.map(filePath => {
				if (!fs.existsSync(filePath)) {
					const newPath = path.resolve(
						path.dirname(configurationSourceFilePath),
						filePath
					);
					if (!fs.existsSync(newPath)) {
						throw `Bad relative file path. ${filePath} resolves to ${newPath} which does not exist (From config ${configurationSourceFilePath}.)`;
					}
					filePath = newPath;
				}

				const appendage = multiIni.read(filePath).qtNumberKeysToArray();
				if (Object.keys(appendage).length == 0) {
					throw `No properties in _merge file. This is usually because there is no top level .ini [section]. multiIni insists on this. Bad filepath is ${filePath}`;
				}
	
				includedFiles.push(filePath);
				return appendage;
			});

			config = appendages.reduce((result, component) => {
				return result.qtMerge(component);
			}, config);
		}

		//substitutions supplied in args are assumed to be client overrides and are processed
		//first. That means that the tokens are not available for subsitution by the
		//values in the file.

		if (typeof options.userSubstitutions == 'object') {
			const configString = JSON.stringify(config);
			const revisedConfigString = configString.qtTemplateReplace(
				options.userSubstitutions
			);
			

			try {
				config = JSON.parse(revisedConfigString);
				config._meta.userSubstitutions = options.userSubstitutions;
			} catch (err) {
				throw `qtools-config-files-processor says, 'args._substitutions' processing is actually string processing on JSON.stringify(config). The result does not JSON.parse(revisedConfigString). The error message is ${err.toString()}.`;
			}
		}

		if (typeof config._substitutions == 'object') {
			const configString = JSON.stringify(config);
			const revisedConfigString = configString.qtTemplateReplace(
				config._substitutions
			);
			try {
				config = JSON.parse(revisedConfigString);
			} catch (err) {
				throw `qtools-config-files-processor says, 'config._substitutions' processing is actually string processing on JSON.stringify(config). The result does not JSON.parse(revisedConfigString). The error message is ${err.toString()}.`;
			}
		}

		if (injectedItems) {
			config.injectedItems = injectedItems;
		}
		
		config._meta._substitutions=config._substitutions;
		config._meta._includes=includedFiles;

		return config;
	};
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

