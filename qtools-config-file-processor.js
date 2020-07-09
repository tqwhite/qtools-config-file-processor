'use strict';

const multiIni = require('multi-ini');
const fs = require('fs');
const path = require('path');
var qtLib = require('qtools-functional-library');

//START OF moduleFunction() ============================================================

var moduleFunction = function(args = {}) {
	const { logger = {}, arrayItemsName = 'arrayItems' } = args;

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

	this.getConfig = (configPath, workingDirectory = '.', options = {}) => {
		const { resolve = false } = options;
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

		const config = multiIni
			.read(configurationSourceFilePath)
			.qtNumberKeysToArray()
			.qtMerge({
				configurationSourceFilePath,
				configurationModificationDate
			});

		return config;
	};
};

//END OF moduleFunction() ============================================================

//module.exports = moduleFunction;
module.exports = new moduleFunction();

