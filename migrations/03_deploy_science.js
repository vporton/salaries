const ethers = require('ethers');
const fs = require('fs');
const { myDeploy, updateAddress } = require('../lib/default-deployer');
const { deployProxy, admin } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  const uuid = '4a4552a6-4644-11eb-a830-3f3c92c66629';

  const DefaultDAOInterface = artifacts.require("DefaultDAOInterface");
  const dao = process.env.DAO_ADDRESS;

  await deployProxy(DefaultDAOInterface, [], { deployer });
  const daoPlugin = await DefaultDAOInterface.deployed();
  // await admin.changeProxyAdmin(daoPlugin.address, dao, { deployer });
  await admin.transferProxyAdminOwnership(dao);

  const science = await myDeploy(deployer, network, accounts, "SalaryWithDAO", daoPlugin.address, `urn:uuid:${uuid}`);

  ({ logs } = await science.createOracle());
  const oracleId = logs[0].args.oracleId;
  await science.changeOracleOwner(dao, oracleId);

  // TODO: duplicate code
  {
    const addressesFileName = `abi/addresses.json`;
    let json;
    try {
        const text = fs.readFileSync(addressesFileName);
        json = JSON.parse(text);
    }
    catch(_) {
        json = {};  
    }
    updateAddress(json, network, 'oracleId', oracleId);
    fs.writeFileSync(addressesFileName, JSON.stringify(json));
  }
};
