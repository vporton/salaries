import Web3 from 'web3';
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

let _web3Provider = null;

export async function baseGetWeb3() {
  if (window.web3 && window.web3.chainId) return window.web3;

  _web3Provider = Web3.givenProvider; //await getWeb3Provider();
  return window.web3 = _web3Provider ? new Web3(_web3Provider) : null;
}

export async function getChainId() {
  const web3 = await baseGetWeb3();
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
