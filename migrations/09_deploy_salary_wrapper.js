const fs = require('fs');
const { myDeploy } = require('../lib/default-deployer');

const uuid = 'f322e3ec-5e4b-11eb-9886-47f6a3a470a4';

module.exports = async function(deployer, network, accounts) {
    const addressesFileName = `abi/addresses.json`;
    let json;
    const text = fs.readFileSync(addressesFileName);
    json = JSON.parse(text);

    const j = json[network === 'development' ? 'local' : network];
    const salaries = j.SalaryWithDAO.address;
    await myDeploy(deployer, network, accounts, "UnitedSalaryTokenWrapper", salaries, `urn:uuid:${uuid}`);
};
