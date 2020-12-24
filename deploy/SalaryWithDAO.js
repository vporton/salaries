const myDeploy = require('../lib/wrapper-deployer');
const contractName = 'SalaryWithDAO';
const uuid = '7eebfd10-45af-11eb-8e6f-07f435f317d2';

module.exports = myDeploy(contractName, `urn:uuid:${uuid}`);
module.exports.tags = [contractName];
