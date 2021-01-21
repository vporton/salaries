const fs = require('fs');
const { myDeploy } = require('../lib/default-deployer');

module.exports = async function(deployer, network, accounts) {
    const addressesFileName = `abi/addresses.json`;
    let json;
    const text = fs.readFileSync(addressesFileName);
    json = JSON.parse(text);

    const locker = json[network].SalaryWithDAO.address;
    const erc1155LockedETH = json[network].ERC1155LockedETH.address;
    await myDeploy(deployer, network, accounts, "DonateETH", locker, erc1155LockedETH);
};
