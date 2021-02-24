const assert = require('assert');

module.exports = async function(deployer, network, accounts) {
  const ProxyAdmin = artifacts.require("ProxyAdmin");
  await deployer.deploy(ProxyAdmin, { from: accounts[0] });
  const proxyAdmin = await ProxyAdmin.deployed();
  // await admin.transferProxyAdminOwnership(dao);
  proxyAdmin.transferOwnership(process.env.DAO_ADDRESS);
  assert(await proxyAdmin.owner() == process.env.DAO_ADDRESS);
};
