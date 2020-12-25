const myDeploy = require('../lib/default-deployer');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  { // Deploy science.
    const uuid = '4a4552a6-4644-11eb-a830-3f3c92c66629';
    const DefaultDAOInterface = artifacts.require("DefaultDAOInterface");
    // FIXME: Add owner DAO.
    await deployProxy(DefaultDAOInterface, []/*, { deployer: }*/);
    await myDeploy(deployer, network, accounts, "SalaryWithDAO", (await DefaultDAOInterface.deployed()).address, `urn:uuid:${uuid}`);
  }
};
