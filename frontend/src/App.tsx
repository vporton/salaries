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

function App() {
  const [donateFor, setDonateFor] = useState('');
  const [paymentKind, setPaymentKind] = useState('bequestAll');
  const [tokenKind, setTokenKind] = useState('');
  const [bequestDate, setBequestDate] = useState(new Date());

  return (
    <div className="App">
      <header className="App-header">
        <h1>Donate / Bequest</h1>
        <p>This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore, donate or bequest here for the software
          and the free market to choose the best donation recepient.</p>
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
            <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestAll')} checked={paymentKind === 'bequestAll'}/>
            {' '}
            Bequest all funds on your account
          </label>
        </p>
        <p>
          Donation in:
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc1155')}/> ERC-1155</label> (recommended)
          {' '}
          <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc20')}/> ERC-20</label>
        </p>
        <div style={{display: paymentKind !== 'bequestAll' ? 'block' : 'none'}}>
          <p>
            Token address:
            {' '}
            <Address/>
          </p>
          <p style={{display: tokenKind === 'erc1155' ? 'block' : 'none'}}>
            Token ID:
            {' '}
            <Uint256/>
          </p>
          <p>
            Donation amount:
            {' '}
            <Amount/>
            {' '}
            <button>Donate</button>
          </p>
        </div>
        <div style={{display: paymentKind === 'bequestAll' ? 'block' : 'none'}}>
          <p>
            Date bequest can be withdrawn:
            <br/>
            <span style={{display: 'inline-block'}}>
              <Calendar value={bequestDate}/>
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
