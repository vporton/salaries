const fs = require('fs');
const { myDeploy } = require('../lib/default-deployer');

module.exports = async function(deployer, network, accounts) {
    const addressesFileName = `abi/addresses.json`;
    let json;
    const text = fs.readFileSync(addressesFileName);
    json = JSON.parse(text);

    await myDeploy(deployer, network, accounts, "NFTRestoreContract");
};
