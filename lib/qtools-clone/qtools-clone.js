const clone=(inObj, func)=>{

	const toType = (obj) => {
		if (obj === null) {
			return 'null';
		} else if (typeof obj == 'undefined') {
			return 'undefined';
		} else {
			return {}.toString
				.call(obj)
				.match(/\s([a-z|A-Z]+)/)[1]
				.toLowerCase();
		}
	};
	
	
		let convertFunction =
			typeof func == 'function'
				? func
				: function(inData) {
						return inData;
					};

		if (
			['string', 'number', 'boolean', 'undefined'].indexOf(typeof inObj) > -1 ||
			inObj === null
		) {
			return convertFunction(inObj);
		}

		if (toType(inObj) == 'null') {
			return convertFunction(inObj);
		}

		if (!newObj) {
			if (toType(inObj) == 'array') {
				var newObj = [];
			} else {
				var newObj = {};
			}
		}

		if (toType(inObj) != 'array') {
			for (var i in inObj) {
				//I rescinded the numericToArray() prototype function that required this.
				// 				if (typeof(inObj.hasOwnProperty)=='function' && !inObj.hasOwnProperty(i)){
				// 					continue;
				// 				}
				if (inObj[i] !== null && typeof inObj[i] == 'object') {
					switch (inObj[i].constructor) {
						case Date:
							newObj[i] = convertFunction(new Date(inObj[i].toString()));
							break;
						default:
							newObj[i] = clone(inObj[i], func);
							break;
					}
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("OO inObj[i]="+inObj[i]);
				}
			}
		} else {
			for (var i = 0, len = inObj.length; i < len; i++) {
				if (toType(inObj[i]) == 'object') {
					newObj[i] = clone(inObj[i], func);
				} else {
					newObj[i] = convertFunction(inObj[i]);
					//console.log("AA inObj[i]="+inObj[i]);
				}
			}
		}

		return newObj;
	};
	
module.exports=clone;