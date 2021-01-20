import React, { useState, useEffect } from 'react';
import {
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Web3 from 'web3';
import erc1155Abi from './ERC1155Abi';
import erc20Abi from './ERC20Abi';
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
const { toBN, toWei } = Web3.utils;

function DonationsComponent() {
  function Pay() {
    return (
      <header className="App-header">
        <p>
          <small>Free software authors, scientists/inventors, and science/software publishers:</small>
          {' '}
          <NavLink to="/register">Register for a salary.</NavLink>
          <br/>
          <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
        </p>
        <h1>Donate / Bequest</h1>
        <p>This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore,
          {' '}
          <em>donate or bequest</em>
          {' '}
          here for the software and the free market to choose the best donation recepient.</p>
        <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
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
          <EthAddress value={tokenEthAddress} onChange={async (e: Event) => await setTokenEthAddress((e.target as HTMLInputElement).value as string)}/>
        </p>
        <p style={{display: paymentKind !== 'bequestGnosis' && tokenKind === 'erc1155' ? 'block' : 'none'}}>
          Token ID:
          {' '}
          <Uint256 value={tokenId} onChange={async (e: Event) => await setTokenId((e.target as HTMLInputElement).value as string)}/>
        </p>
        <p style={{display: paymentKind !== 'donate' ? 'block' : 'none'}}>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>
            The bequest can be taken after:
          </span>
          <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
          {' '}
          {bequestDate !== null ? bequestDate.toString() : ""}</span>
          <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>
            <br/>
            <span style={{display: 'inline-block'}}>
              <Calendar onChange={(e: any) => setBequestDate(e as Date)} value={bequestDate} minDate={new Date()}/>
            </span>
          </span>
        </p>
        <div style={{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}}>
          <p>
            Donation amount:
            {' '}
            <Amount value={amount} onChange={async (e: Event) => await setAmount((e.target as HTMLInputElement).value as string)}/>
            {' '}
            <button onClick={donate} disabled={donateButtonDisabled()}>Donate</button>
          </p>
        </div>
        <p style={{display: paymentKind === 'bequestGnosis' ? 'block' : 'none'}}>
          <button className="donateButton" disabled={bequestButtonDisabled()} onClick={bequestAll}>Bequest!</button>
        </p>
      </header>
    );
  }

  function Register() {
    async function register() {
      const web3 = await getWeb3();
      const account = (await getAccounts())[0];
      if (web3 && account !== null) {
        const addresses = await getAddresses();
        if (!addresses) return;
        const scienceAbi = (await getABIs()).SalaryWithDAO;
        const science = new (web3 as any).eth.Contract(scienceAbi as any, addresses.SalaryWithDAO.address);
        await mySend(science, science.methods.registerCustomer, [oracleId, []], {from: account}, null)
          .catch(e => {
            alert(/You are already registered\./.test(e.message) ? "You are already registered." : e.message);
          });
      }
    }

    return (
      <header className="App-header">
        <p>
          <NavLink to="/">Donate/bequest for science, free software, or climate.</NavLink>
          <br/> 
          <small>Just bequest all your funds here.</small>
        </p>
        <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
        <p>
          <small>Free software authors, scientists/inventors, and science/software publishers:</small>
        </p>
        <p>
          <button className="donateButton" onClick={register}>Register for a salary</button>
          <br/>
          <small>
            After you have been registered, see TODO to improve your rating.
            <br/>
            Remember, if you publish open source, your rating will tend to improve.
          </small>
        </p>
        <p>
          <small>
            Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.
          </small>
          <br/>
          <small>
            No matter what happens, you will receive 1 token per second since the moment of registration till you die
            (or go inopt for corporations).
            <br/>
            Your salary exchange rate will be "calculated" by free market based on future predictions of your performance,
            {' '}
            such as your expected citations count in the future.
          </small>
        </p>
      </header>
    );
  }

  return (
    <div className="App">
      <HashRouter>
        <Route exact path="/" component={Pay}/>
        <Route path="/register" component={Register}/>
        <p>
          <a rel="noreferrer" target="_blank" href="https://github.com/vporton/donations">
            <img src="img/GitHub-Mark-32px.png" width="32" height="32" alt="Source at GitHub"/>
          </a>
        </p>
      </HashRouter>
    </div>
  );
}

function EthAddress({...props}) {
  return (
    <span className="EthAddress">
      <input type="text"
             maxLength={42}
             size={50}
             value={props.value ? props.value : ""}
             onChange={props.onChange}
             className={isEthAddressValid(props.value) ? '' : 'error'}/>
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

export const Donations = DonationsComponent;
//export Donations;
