const ethers = require('ethers');
const { myDeploy } = require('../lib/default-deployer');

const uuid = '21ce1cbc-5bdf-11eb-8f58-a32affe2cc22';

module.exports = async function(deployer, network, accounts) {
    if(process.env.TEST) {
        await myDeploy(deployer, network, accounts, "ERC1155LockedETH", `urn:uuid:${uuid}`);
    }
};
