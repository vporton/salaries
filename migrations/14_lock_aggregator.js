const fs = require('fs');
const { myDeploy } = require('../lib/default-deployer');

module.exports = async function(deployer, network, accounts) {
    const addressesFileName = `abi/addresses.json`;
    let json;
    const text = fs.readFileSync(addressesFileName);
    json = JSON.parse(text);

    const j = json[network === 'development' ? 'local' : network];
    const locker = j.SalaryWithDAO.address;
    const erc1155LockedETH = j.ERC1155LockedETH.address;
    const ERC1155OverERC20 = j.ERC1155OverERC20.address;
    const ERC1155OverERC721 = j.ERC1155OverERC721.address;
    console.log(locker, erc1155LockedETH, ERC1155OverERC20, ERC1155OverERC721)
    await myDeploy(deployer, network, accounts, "LockAggregator", locker, erc1155LockedETH, ERC1155OverERC20, ERC1155OverERC721);
};
