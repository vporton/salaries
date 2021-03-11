const ethers = require('ethers');
const { myDeploy } = require('../lib/default-deployer');

const uuid = '3d30c904-7378-11eb-ac9a-c3dfb5f41981';

module.exports = async function(deployer, network, accounts) {
    if(process.env.TEST || network === 'development') {
        const wrapper = await myDeploy(deployer, network, accounts, "ERC1155OverERC721", `urn:uuid:${uuid}`);
    }
};
