const fs = require('fs');

function updateAddress(json, network, property, value) {
    if (network == 'ganache') {
        network = 'local';
    }
    switch (network) {
        case 'local':
        case 'mainnet':
        case 'goerli':
        case 'kovan':
        case 'matic':
        case 'mumbai':
        case 'ropsten':
        case 'rinkeby':
        case 'sokol':
        case 'core':
        case 'xdai':
        case 'callisto':
        case 'bsc':
        case 'bsctest':
            if (!json[network]) {
                json[network] = {};
            }
            json[network][property] = value;
    }
}

async function myDeploy(deployer, network, accounts, contractName, ...args) {
    const contract = artifacts.require(contractName);
    await deployer.deploy(contract, ...args, {overwrite: false, from: accounts[0]}); // `from` for Truffle 5.1.58 bug
    const deployResult = await contract.deployed();

    {
        const abisFileName = `frontend/public/abis.json`;
        let json;
        try {
            const text = fs.readFileSync(abisFileName);
            json = JSON.parse(text);
        }
        catch(_) {
            json = {};  
        }
        json[contractName] = deployResult.abi;
        fs.writeFileSync(abisFileName, JSON.stringify(json));
    }

    {
        const addressesFileName = `frontend/public/addresses.json`;
        let json;
        try {
            const text = fs.readFileSync(addressesFileName);
            json = JSON.parse(text);
        }
        catch(_) {
            json = {};  
        }
        updateAddress(json, network, contractName, {
            address: deployResult.address,
        });
        fs.writeFileSync(addressesFileName, JSON.stringify(json));
    }

    return deployResult;
}

module.exports = {
    updateAddress,
    myDeploy,
}
