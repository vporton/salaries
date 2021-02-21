const ethers = require('ethers');
const { myDeploy } = require('../lib/default-deployer');

const uuid = '183db4f2-3dce-11eb-92a8-0b35ea444c93';

module.exports = async function(deployer, network, accounts) {
    if(process.env.TEST) {
        const wrapper = await myDeploy(deployer, network, accounts, "ERC1155OverERC20", `urn:uuid:${uuid}`);
    }
};
