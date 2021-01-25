import Web3 from 'web3';
import Web3Modal from "web3modal";
import Portis from "@portis/web3";
import Authereum from "authereum";
import ethProvider from "eth-provider";
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
const { toBN } = Web3.utils;

// TODO
export const CHAINS = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '1337': 'local',
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
  '56': 'bsc',
  '97': 'bsctest',
}

export let web3Modal = null;
export let web3ModalProvider = null;

async function defaultWeb3Provider(networkname) {
  const providerOptions = {
    portis: {
      package: Portis, // required
      options: {
        id: "4f1af1e4-2205-4244-a2d3-59e3527a614b" // required
      }
    },
    authereum: {
      package: Authereum // required
    },
    frame: {
      package: ethProvider // required
    }
  };  
  web3Modal = new Web3Modal({
    network: networkname, // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
  
  return web3ModalProvider = await web3Modal.connect();
}

export async function baseGetWeb3Provider(providername, networkname) {
  return providername ? providername : await defaultWeb3Provider(networkname);
}

export async function baseGetWeb3(providername, networkname) {
  // if (window.web3 && window.web3.chainId) return window.web3;

  const _web3Provider = await baseGetWeb3Provider(providername, networkname)
  return window.web3 = _web3Provider ? new Web3(_web3Provider) : Web3.givenProvider ? new Web3() : null;
}

export async function getChainId(providername, networkname) {
  const web3 = await baseGetWeb3(providername, networkname);
  if (!web3) {
    return null;
  }
  return await web3.eth.getChainId();
}

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

export async function getWeb3Provider(providername, networkname) {
  return await baseGetWeb3Provider(providername, networkname);
}

export async function getWeb3(providername, networkname) {
  try {
    window.ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
  }
  catch(_) { /* empty */ }
  const web3 = await baseGetWeb3(providername, networkname);
  getAccounts().then((/*accounts*/) => {
    // setConnectedToAccount(accounts.length !== 0); // TODO
  });
  return web3;
}

export async function getABIs(PREFIX) {
  return await fetchOnceJson(PREFIX + `abis.json`);
}

export async function getAddresses(PREFIX, providername, networkname) {
  const [json, chainId] = await Promise.all([fetchOnceJson(PREFIX + `addresses.json`), getChainId(providername, networkname)]);
  // TODO: Remove CHAINS variable?
  if (!CHAINS[chainId] || !json[CHAINS[chainId]]) {
    // alert("The selected blockchain is not supported!");
    return null;
  }
  const addresses = json[CHAINS[chainId]];
  if (!addresses.SalaryWithDAO) return null; // TODO: Crude hack here!
  return addresses;
}

export async function getAccounts(providername, networkname) {
  const web3 = await baseGetWeb3(providername, networkname);
  return web3 ? web3.eth.getAccounts() : null;
}

// FIXME: returns Promise?
export async function mySend(contract, method, args, sendArgs, handler) {
  sendArgs = sendArgs || {}
  const account = (await getAccounts())[0];
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
