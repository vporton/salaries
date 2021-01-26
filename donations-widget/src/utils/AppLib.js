import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
const { toBN } = Web3.utils;

export function isUint256Valid(v) {
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)));
}

export function isRealNumber(v) {
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

let _fetchedJsonPromises = new Map();
let _fetched = new Map();

async function fetchOnceJsonPromise(url) {
  let promise = _fetchedJsonPromises.get(url);
  if (promise) {
    return promise;
  } else {
    const fetchResult = await fetch(url);
    promise = fetchResult.json();
    _fetchedJsonPromises.set(url, promise);
    return await promise;
  }
}

export async function fetchOnceJson(url) {
  let json = _fetched.get(url);
  if (json) {
    return json;
  } else {
    json = await fetchOnceJsonPromise(url);
    _fetched.set(url, json);
    return json;
  }
}

// export async function getWeb3(providername, networkname) {
//   try {
//     window.ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
//   }
//   catch(_) { /* empty */ }
//   const web3 = await baseGetWeb3(providername, networkname);
//   getAccounts().then((/*accounts*/) => {
//     // setConnectedToAccount(accounts.length !== 0); // TODO
//   });
//   return web3;
// }

export async function getABIs(PREFIX) {
  return await fetchOnceJson(PREFIX + `abis.json`);
}

export async function getAccounts(web3) {
  return web3 ? web3.eth.getAccounts() : null;
}

// FIXME: returns Promise?
export async function mySend(web3, contract, method, args, sendArgs, handler) {
  sendArgs = sendArgs || {}
  const account = (await getAccounts(web3))[0];
  return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs})
    .then((estimatedGas) => {
      const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
      if (handler !== null) {
        return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
      } else {
        return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
      }
    });
}

export async function getAddresses(PREFIX, networkname) {
  if (!addresses) return null;
  const json = await fetchOnceJson(PREFIX + `addresses.json`);
  const addresses = json[networkname];
  if (!addresses.SalaryWithDAO) return null; // TODO: Crude hack here!
  return addresses;
}
