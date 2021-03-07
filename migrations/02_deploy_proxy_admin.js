// const assert = require('assert');

// module.exports = async function(deployer, network, accounts) {
//   const ProxyAdmin = artifacts.require("ProxyAdmin");
//   await deployer.deploy(ProxyAdmin, { from: accounts[0], /*overwrite: network === 'development'*/ });
//   const proxyAdmin = await ProxyAdmin.deployed();
//   // await admin.transferProxyAdminOwnership(dao);
//   await proxyAdmin.transferOwnership(process.env.DAO_ADDRESS);
//   assert((await proxyAdmin.owner()).toLowerCase() === process.env.DAO_ADDRESS.toLowerCase());
// };
