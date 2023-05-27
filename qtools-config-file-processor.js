'use strict';

const multiIni = require('multi-ini');
const fs = require('fs');
const path = require('path');
const qtLib = require('qtools-functional-library');
const multiIniGen = require('multi-ini');
const os=require('os');

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

	let configurationSourceFilePath = '';

	this.getRecentConfigPath = () => configurationSourceFilePath;

	this.getConfig = (configPath, workingDirectory, options = {}) => {
		const { resolve = false, userSubstitutions, injectedItems } = options;
		if (!workingDirectory) {
			workingDirectory = '.';
		}
		configurationSourceFilePath = findGoodConfigPath(
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

		const raw = multiIni.read(configurationSourceFilePath);

		let config = raw.qtNumberKeysToArray().qtMerge({
			_meta: {
				configurationSourceFilePath,
				configurationModificationDate
			}
		});

		const configString = JSON.stringify(config);
		const includedFiles = [];
		const mergeBeforeFiles = [];
		const mergeAfterFiles = [];
		const includedRaw = [];
		const mergeBeforeRaw = [];
		const mergeAfterRaw = [];

		if (config._mergeBefore && config._mergeBefore.length) {
			const appendages = config._mergeBefore.map(filePath => {
				if (!fs.existsSync(filePath)) {
					const newPath = path.resolve(
						path.dirname(configurationSourceFilePath),
						filePath
					);
					if (!fs.existsSync(newPath)) {
						throw `Bad relative file path in _mergeBefore. ${filePath} resolves to ${newPath} which does not exist (From config ${configurationSourceFilePath}.)`;
					}
					filePath = newPath;
				}

				const appendageRaw = multiIni.read(filePath);
				const appendage = appendageRaw.qtNumberKeysToArray();
				if (Object.keys(appendage).length == 0) {
					throw `No properties in _mergeBefore file. This is usually because there is no top level .ini [section]. multiIni insists on this. Bad filepath is ${filePath}`;
				}

				mergeBeforeFiles.push(filePath);
				mergeBeforeRaw.push(appendageRaw);
				return appendage;
			});

			config = appendages
				.reduce((result, component) => {
					return result.qtMerge(component);
				}, {})
				.qtMerge(config);
		}

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

				const appendageRaw = multiIni.read(filePath);
				const appendage = appendageRaw.qtNumberKeysToArray();
				if (Object.keys(appendage).length == 0) {
					throw `No properties in _merge file. This is usually because there is no top level .ini [section]. multiIni insists on this. Bad filepath is ${filePath}`;
				}

				includedFiles.push(filePath);
				includedRaw.push(appendageRaw);
				return appendage;
			});

			config = appendages.reduce((result, component) => {
				return result.qtMerge(component);
			}, config);
		}

		if (config._mergeAfter && config._mergeAfter.length) {
			const appendages = config._mergeAfter.map(filePath => {
				if (!fs.existsSync(filePath)) {
					const newPath = path.resolve(
						path.dirname(configurationSourceFilePath),
						filePath
					);
					if (!fs.existsSync(newPath)) {
						throw `Bad relative file path in _mergeAfter. ${filePath} resolves to ${newPath} which does not exist (From config ${configurationSourceFilePath}.)`;
					}
					filePath = newPath;
				}

				const appendageRaw = multiIni.read(filePath);
				const appendage = appendageRaw.qtNumberKeysToArray();
				if (Object.keys(appendage).length == 0) {
					throw `No properties in _mergeAfter file. This is usually because there is no top level .ini [section]. multiIni insists on this. Bad filepath is ${filePath}`;
				}

				mergeAfterFiles.push(filePath);
				mergeAfterRaw.push(appendageRaw);
				return appendage;
			});

			config = config.qtMerge(
				appendages.reduce((result, component) => {
					return result.qtMerge(component);
				}, {})
			);
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

		if ('always substitute system items') {
			const configString = JSON.stringify(config);
			const revisedConfigString = configString.qtTemplateReplace(
				{
					userHomeDir:os.homedir(),
					configsDir:path.dirname(configurationSourceFilePath)
				
				}
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

		config._meta._substitutions = config._substitutions;
		config._meta._includes = includedFiles;
		config._meta._mergeBefore = mergeBeforeFiles;
		config._meta._mergeAfter = mergeAfterFiles;
		config._meta._mainRaw = raw;
		config._meta._includedRaw = includedRaw;
		config._meta._mergeBeforeRaw = mergeBeforeRaw;
		config._meta._mergeAfterRaw = mergeAfterRaw;

		return config;
	};
	return this;
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

