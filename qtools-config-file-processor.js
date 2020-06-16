'use strict';

const multiIni=require('multi-ini')
const fs=require('fs');
const path = require('path');
var qtLib=require('qtFunctionalLib');


//START OF moduleFunction() ============================================================

var moduleFunction = function(args={}) {
	const {logger={}, arrayItemsName='arrayItems'}=args;

	logger.warn=logger.warn?logger.warn: message=>console.log(`WARNING: ${message}`);
	logger.error=logger.error?logger.error: message=>console.log(`ERROR: ${message}`);


	const upgradeConfigItems = (outObj, additionalProperties = {}) => {
		for (var i in outObj[arrayItemsName]) {
			if (!outObj[arrayItemsName].hasOwnProperty(i)) {
				continue;
			}

			var element = outObj[arrayItemsName][i];
			outObj.qtPutSurePath(element, 'placeholder');

			const inObj = outObj.qtGetSurePath( element, []);

			const outArray = inObj.qtNumberKeysToArray(); //qtNumberKeysToArray() closes holes in array
			outObj.qtPutSurePath(element, outArray);
		}

		return Object.assign(additionalProperties, outObj);
	};

	const findGoodConfigPath = (pathParm, workingDirectory, resolve) => {
		let result = fs.existsSync(pathParm)?fs.realpathSync(pathParm):'';
		workingDirectory = workingDirectory?fs.realpathSync(workingDirectory):'';
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

	let multiIni = require('multi-ini');
	multiIni = new multiIni.Class({
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

	//Object.assign(this, multiIni);
	//this.upgradeConfigItems = upgradeConfigItems;

	this.getConfig = (
		configPath,
		workingDirectory='.',
		options = {}
	) => {
		const { resolve = false, arrayPaths } = options;
		let config;
		const configurationSourceFilePath = findGoodConfigPath(
			configPath,
			workingDirectory,
			resolve
		);
		if (!configurationSourceFilePath) {
			logger.error(`no config file found ${configPath}`);
			return;
		} else {
			const tmp = multiIni.read(configurationSourceFilePath); //this is multi-ini with post-processing
			const configurationModificationDate = fs
				.statSync(configurationSourceFilePath)
				.mtime.toLocaleString();
			config = upgradeConfigItems(tmp, {
				configurationSourceFilePath,
				configurationModificationDate
			});
		}

		if (arrayPaths) {
			arrayPaths.forEach(itemPath =>
				config.qtPutSurePath(
					itemPath,
					config.qtGetSurePath(itemPath, {}).qtNumberKeysToArray()
				)
			);
		}

		return config;
	};
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

