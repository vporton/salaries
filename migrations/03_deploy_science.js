const { myDeploy } = require('../lib/default-deployer');
const { deployProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  const uuid = '4a4552a6-4644-11eb-a830-3f3c92c66629';
  const DefaultDAOInterface = artifacts.require("DefaultDAOInterface");
  const dao = deployer; // FIXME: Add owner DAO.
  await deployProxy(DefaultDAOInterface, [], { deployer: dao });
  const science = await myDeploy(deployer, network, accounts, "SalaryWithDAO", (await DefaultDAOInterface.deployed()).address, `urn:uuid:${uuid}`);
  // https://github.com/trufflesuite/truffle/issues/3645
  // ({ logs } = await science.createOracle({ from: dao }));
  // const oracleId = logs[0].args.oracleId;

  // // TODO: duplicate code
  // {
  //   const addressesFileName = `frontend/public/addresses.json`;
  //   let json;
  //   try {
  //       const text = fs.readFileSync(addressesFileName);
  //       json = JSON.parse(text);
  //   }
  //   catch(_) {
  //       json = {};  
  //   }
  //   updateAddress(json, network, 'data', {
  //       scienceOracleId: oracleId,
  //   });
  //   fs.writeFileSync(addressesFileName, JSON.stringify(json));
  // }
};
