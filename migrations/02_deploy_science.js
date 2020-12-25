const myDeploy = require('../lib/default-deployer');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  const uuid = '4a4552a6-4644-11eb-a830-3f3c92c66629';
  const DefaultDAOInterface = artifacts.require("DefaultDAOInterface");
  await deployProxy(DefaultDAOInterface, [], { deployer/*, initializer: 'store'*/ }); // FIXME: Owner?
  await myDeploy(deployer, network, accounts, "SalaryWithDAO", (await DefaultDAOInterface.deployed()).address, `urn:uuid:${uuid}`);
};
