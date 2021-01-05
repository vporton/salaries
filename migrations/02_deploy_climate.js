const fs = require('fs');
const { myDeploy, updateAddress } = require('../lib/default-deployer');

module.exports = async function(deployer, network, accounts) {
  const globalCommunityFund = accounts[0]; // FIXME
  const carbon = await myDeploy(deployer, network, accounts, "Carbon",
    globalCommunityFund,
    "Retired carbon credits", "M+", "856d7f62-48c3-11eb-a9a2-e740f853e717",
    "Non-retired carbon credits", "M-", "85d61e3c-48c3-11eb-8a97-ff3b9fcccdb2"
  );
  const uuid = '1bb89f0c-47ab-11eb-9b52-2bc780f5fac3';
  const climate = await myDeploy(deployer, network, accounts, "Lock", `urn:uuid:${uuid}`);
  const retiredCarbonTokenId = 1;
  ({ logs } = await climate.createOracle({contractAddress: climate.address, tokenId: retiredCarbonTokenId}));
  const oracleId = logs[0].args.oracleId;

  // TODO: duplicate code
  {
    const addressesFileName = `donations-widget/public/addresses.json`;
    let json;
    try {
        const text = fs.readFileSync(addressesFileName);
        json = JSON.parse(text);
    }
    catch(_) {
        json = {};  
    }
    updateAddress(json, network, 'data', {
        climateOracleId: oracleId,
    });
    fs.writeFileSync(addressesFileName, JSON.stringify(json));
  }
};
