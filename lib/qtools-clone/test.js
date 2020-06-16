
const clone=require('qtools-clone');

const commonComponent={c:'d', x:111, y:true};
const originalObject={a:'b', commonComponent};
const cloneObject=clone(originalObject);
const copyObject=originalObject;

cloneObject.commonComponent.c='this should only appear in one object'
console.dir({"originalObject [test.js.]":originalObject});
console.dir({"cloneObject [test.js.]":cloneObject});

copyObject.commonComponent.c='this should appear in BOTH objects'
console.dir({"originalObject [test.js.]":originalObject});
console.dir({"copyObject [test.js.]":copyObject});
