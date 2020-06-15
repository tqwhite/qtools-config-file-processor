'use strict';

//START OF moduleFunction() ============================================================

var moduleFunction = function(qtools) {
	const path = require('path');
	const arrayItemsName = 'arrayItems';

	const upgradeConfigItems = (config, additionalProperties = {}) => {
		const outObj = qtools.clone(config);
		for (var i in config[arrayItemsName]) {
			if (!config[arrayItemsName].hasOwnProperty(i)) {
				continue;
			}

			var element = config[arrayItemsName][i];
			qtools.putSurePath(outObj, element, 'placeholder');

			const inObj = qtools.getSurePath(config, element, []);

			const outArray = inObj.qtNumberKeysToArray(); //qtNumberKeysToArray() closes holes in array
			qtools.putSurePath(outObj, element, outArray);
		}

		return Object.assign(additionalProperties, outObj);
	};

	const findGoodConfigPath = (pathParm, workingDirectory, resolve) => {
		let result = qtools.realPath(pathParm);
		workingDirectory = qtools.realPath(workingDirectory);
		if (result) {
			return result;
		} else if (workingDirectory) {
			while (
				workingDirectory != '/' &&
				!qtools.realPath(path.join(workingDirectory, pathParm))
			) {
				if (resolve) {
					qtools.logDebug(`tried: ${path.join(workingDirectory, pathParm)}`);
				}
				workingDirectory = path.dirname(workingDirectory);
			}
			const result =
				workingDirectory != '/' ? path.join(workingDirectory, pathParm) : '';
			if (resolve) {
				qtools.logDebug(`finished with: ${result}`);
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

	qtools.configFileProcessor = multiIni;
	qtools.configFileProcessor.upgradeConfigItems = upgradeConfigItems;

	qtools.configFileProcessor.getConfig = (
		configPath,
		workingDirectory,
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
			qtools.logError(`no config file found ${configPath}`);
			return;
		} else {
			const tmp = qtools.configFileProcessor.read(configurationSourceFilePath); //this is multi-ini with post-processing
			const configurationModificationDate = qtools.fs
				.statSync(configurationSourceFilePath)
				.mtime.toLocaleString();
			config = qtools.configFileProcessor.upgradeConfigItems(tmp, {
				configurationSourceFilePath,
				configurationModificationDate
			});
		}

		if (arrayPaths) {
			arrayPaths.forEach(itemPath =>
				qtools.putSurePath(
					config,
					itemPath,
					qtools.getSurePath(config, itemPath, {}).qtNumberKeysToArray()
				)
			);
		}

		return config;
	};
	qtools.configFileProcessor.setArrayItemsName = newArrayItemsName => {
		arrayItemsName = newArrayItemsName;
	};
};

//END OF moduleFunction() ============================================================

module.exports = moduleFunction;
//module.exports = new moduleFunction();

