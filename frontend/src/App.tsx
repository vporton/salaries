import React, { useState, useEffect } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';
import Web3 from 'web3';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
const { toBN, fromWei, toWei } = Web3.utils;

// TODO
const CHAINS: { [id: string] : string } = {
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

let _web3Provider: any = null;

let myWeb3: any = null;

async function baseGetWeb3() {
  if(myWeb3) return myWeb3;

  _web3Provider = Web3.givenProvider; //await getWeb3Provider();
  return myWeb3 = _web3Provider ? new Web3(_web3Provider) : null;
}

async function getChainId(): Promise<any> { // TODO: more specific type
  const web3 = await baseGetWeb3();
  if (!web3) {
    return null;
  }
  return await (web3 as any).eth.getChainId();
}

function isAddressValid(v: string): boolean { // TODO: called twice
  return Web3.utils.isAddress(v);
}

function isUint256Valid(v: string): boolean { // TODO: called twice
  return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)));
}

function isRealNumber(v: string): boolean { // TODO: called twice
  return /^[0-9]+(\.[0-9]+)?$/.test(v);
}

let _fetchedJsonPromises = new Map<string, Promise<any>>();
let _fetched = new Map<string, any>();

async function fetchOnceJsonPromise(url: string): Promise<Promise<any>> {
  let promise = _fetchedJsonPromises.get(url);
  if (promise) {
    return promise;
  } else {
    const fetchResult = await fetch(url);
    promise = fetchResult.json() as Promise<any>;
    _fetchedJsonPromises.set(url, promise);
    return await promise;
  }
}

async function fetchOnceJson(url: string): Promise<any> {
  let json = _fetched.get(url);
  if (json) {
    return json;
  } else {
    json = await fetchOnceJsonPromise(url);
    _fetched.set(url, json);
    return json;
  }
}

function App() {
  const [donateFor, setDonateFor] = useState('');
  const [paymentKind, setPaymentKind] = useState('bequestTokens');
  const [tokenKind, setTokenKind] = useState('');
  const [bequestDate, setBequestDate] = useState(new Date());
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState('');

  async function getWeb3() {
    try {
      (window as any).ethereum.enable().catch(() => {}); // Without this catch Firefox 84.0 crashes on user pressing Cancel.
    }
    catch(_) { }
    const web3 = await baseGetWeb3();
    getAccounts().then((accounts) => {
      // setConnectedToAccount(accounts.length !== 0); // TODO
    });
    return web3;
  }

  async function getABIs() {
    return await fetchOnceJson(`abis.json`);
  }

  async function getAddresses() {
    const [json, chainId] = await Promise.all([fetchOnceJson(`addresses.json`), getChainId()]);
    return CHAINS[chainId] ? json[CHAINS[chainId]] : null;
  }

  async function getAccounts(): Promise<Array<string>> {
    const web3 = await baseGetWeb3();
    return web3 ? (web3 as any).eth.getAccounts() : null;
  }

  // FIXME: returns Promise?
  async function mySend(contract: string, method: any, args: Array<any>, sendArgs: any, handler: any): Promise<any> {
    sendArgs = sendArgs || {}
    const account = (await getAccounts())[0];
    return method.bind(contract)(...args).estimateGas({gas: '1000000', from: account, ...sendArgs})
        .then((estimatedGas: string) => {
            const gas = String(Math.floor(Number(estimatedGas) * 1.15) + 24000);
            if(handler !== null)
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs}, handler);
            else
                return method.bind(contract)(...args).send({gas, from: account, ...sendArgs});
        });
  }
  
  async function getERC1155Token() {
    let collateralContractAddress, collateralTokenId;
    switch(tokenKind) {
      case 'erc1155':
        collateralContractAddress = tokenAddress;
        collateralTokenId = tokenId;
        break;
      case 'erc20':
        collateralContractAddress = (await getAddresses())["ERC1155OverERC20"].address;
        collateralTokenId = Web3.utils.toHex(tokenAddress);
        break;
    }
    return [collateralContractAddress, collateralTokenId];
  }

  async function donateForScience() {
    const wei = toWei(amount);
    const abi = (await getABIs()).ERC20LockedERC1155;
    const web3 = await getWeb3();
    if (web3 !== null) {
      try {
        const contractAddress = (await getAddresses())["SalaryWithDAO"].address;
        const science = new (web3 as any).eth.Contract(abi as any, contractAddress);
        const account = (await getAccounts())[0];
        if(!account) {
          // setConnectedToAccount(false); // TODO
          return;
        }
        const [collateralContractAddress, collateralTokenId] = await getERC1155Token();
        // FIXME: Specify market and oracle IDs.
        await mySend(science, science.methods.donate,
                     [collateralContractAddress,
                      collateralTokenId,
                      0,
                      0,
                      wei,
                      account,
                      account,
                      []],
                     {from: account}, null);
          // .catch(e => alert(e.message));
      }
      catch(e) {
        alert(e.message);
      }
    }
  }

  function donate() {
    switch(donateFor) {
      case 'science':
        donateForScience();
        break;
      case 'climate':
        alert('Climate donataions are not yet implemented.')
        break;
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Donate / Bequest</h1>
        <p>This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore,
          {' '}
          <em>donate or bequest</em>
          {' '}
          here for the software and the free market to choose the best donation recepient.</p>
        <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
        <p>
          Donate for:
          {' '}
          <label><input type="radio" name="donateFor" onClick={() => setDonateFor('science')}/> Science and free software</label>
          {' '}
          <label><input type="radio" name="donateFor" onClick={() => setDonateFor('climate')}/> Climate</label>
        </p>
        <p>
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('donate')} checked={paymentKind === 'donate'}/>
            {' '}
            Donate a sum
          </label>
          {' '}
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestTokens')} checked={paymentKind === 'bequestTokens'}/>
            {' '}
            Donate but allow me to take money back
          </label>
          {' '}
          <label>
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestGnosis')} checked={paymentKind === 'bequestGnosis'}/>
            {' '}
            Bequest all funds on a Gnosis Safe smart wallet
          </label>
        </p>
        <p style={{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}}>
          Donation in:
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc1155')}/> ERC-1155</label>
          {' '}
          <small>(recommended)</small>
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc20')}/> ERC-20</label>
          <br/>
          <small>(Don't use stablecoins for long-time funding.)</small>
        </p>
        <p>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>Wallet address:</span>
          <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>Token address:</span>
          {' '}
          <Address value={tokenAddress} onChange={async (e: Event) => await setTokenAddress((e.target as HTMLInputElement).value as string)}/>
        </p>
        <div style={{display: !/bequest/.test(paymentKind) ? 'block' : 'none'}}>
          <p style={{display: tokenKind === 'erc1155' ? 'block' : 'none'}}>
            Token ID:
            {' '}
            <Uint256 value={tokenId} onChange={async (e: Event) => await setTokenId((e.target as HTMLInputElement).value as string)}/>
          </p>
          <p>
            Donation amount:
            {' '}
            <Amount value={amount} onChange={async (e: Event) => await setAmount((e.target as HTMLInputElement).value as string)}/>
            {' '}
            <button onClick={donate}>Donate</button>
          </p>
        </div>
        <div style={{display: /bequest/.test(paymentKind) ? 'block' : 'none'}}>
          <p>
            Date bequest can be withdrawn:
            <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}> {bequestDate.toString()}</span>
            <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
              <br/>
              <span style={{display: 'inline-block'}}>
                <Calendar onChange={e => setBequestDate(e as Date)} value={bequestDate} minDate={new Date()}/>
              </span>
            </span>
          </p>
          <p>
            <button className="donateButton">Bequest!</button>
          </p>
        </div>
      </header>
    </div>
  );
}

function Address({...props}) {
  return (
    <span className="Address">
      <input type="text"
             maxLength={42}
             size={50}
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isAddressValid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function Uint256({...props}) {
  return (
    <span className="Uint256">
      <input type="text"
             maxLength={78}
             size={92}
             value={props.value}
             onChange={props.onChange}
             className={isUint256Valid(props.value) ? '' : 'error'}/>
    </span>
  )
}

function Amount({...props}  ) {
  return (
    <span className="Amount">
      <input type="text"
             value={props.value ? props.value : ""}
             onChange={props.onChange}
               className={isRealNumber(props.value) ? '' : 'error'}/>
    </span>
  )
}

export default App;
