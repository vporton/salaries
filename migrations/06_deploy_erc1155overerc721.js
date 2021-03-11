const ethers = require('ethers');
const { myDeploy } = require('../lib/default-deployer');

const uuid = '401d58ba-8248-11eb-8c67-c3188f74463c';

module.exports = async function(deployer, network, accounts) {
    if(process.env.TEST || process.env.DEPLOY_ALL || network === 'development') {
        const wrapper = await myDeploy(deployer, network, accounts, "ERC1155OverERC721", `urn:uuid:${uuid}`);
    }
};
