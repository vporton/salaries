const myDeploy = require('../lib/default-deployer');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
    await myDeploy(deployer, network, accounts, "ERC1155OverERC20");
};
