const ethers = require('ethers')
const assert = require('assert');
const fs = require('fs');
const { myDeploy, updateAddress } = require('../lib/default-deployer');

module.exports = async function(deployer, network, accounts) {
  const uuid = '4a4552a6-4644-11eb-a830-3f3c92c66629';

  const Migrations = artifacts.require("Migrations");
  const DefaultDAOInterface = artifacts.require("DefaultDAOInterface");
  // const ProxyAdmin = artifacts.require("ProxyAdmin");
  const TransparentUpgradeableProxy = artifacts.require("TransparentUpgradeableProxy");

  const adapter = Migrations.interfaceAdapter;
  const web3 = adapter.web3;

  await deployer.deploy(DefaultDAOInterface);
  const daoPlugin = await DefaultDAOInterface.deployed();
  // const daoPluginProxy = new ethers.Contract(daoPlugin.address, TransparentUpgradeableProxy.abi);

  // const proxyAdmin = await ProxyAdmin.deployed();
  await deployer.deploy(TransparentUpgradeableProxy, daoPlugin.address, process.env.DAO_ADDRESS, []);
  const daoPluginProxy = await TransparentUpgradeableProxy.deployed();

  const provider = new ethers.providers.Web3Provider(web3.currentProvider);
  const testDAOAddress = await provider.getStorageAt(
    daoPluginProxy.address, '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103');
  assert(testDAOAddress.toLocaleLowerCase() === process.env.DAO_ADDRESS.toLocaleLowerCase());

  const science = await myDeploy(deployer, network, accounts, "SalaryWithDAO", daoPlugin.address, `urn:uuid:${uuid}`);

  ({ logs } = await science.createOracle());
  const oracleId = logs[0].args.oracleId;
  await science.changeOracleOwner(process.env.DAO_ADDRESS, oracleId);

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
    fs.writeFileSync(addressesFileName, JSON.stringify(json, null, 4));
  }
};
