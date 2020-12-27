const ethers = require('ethers');
const { myDeploy } = require('../lib/default-deployer');
const { parseEther } = ethers.utils;

module.exports = async function(deployer, network, accounts) {
    if(process.env.TEST) {
        const wrapper = await myDeploy(deployer, network, accounts, "MockCoin");
        const amount = "10000";
        wrapper.mint(process.env.TEST_ACCOUNT, parseEther(amount));
        console.log(`Minted ${amount} of ${wrapper.address} token to ${process.env.TEST_ACCOUNT}.`)
    }
};
