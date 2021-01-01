<template>
<div>
    <p>
        <small>Free software authors, scientists/inventors, and science/software publishers:</small>
        <NavLink to="/register">Register for a salary.</NavLink>
        <br/>
        <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <p>This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe anymore,
        <em>donate or bequest</em>
        here for the software and the free market to choose the best donation recepient.</p>
    <p style={{color: 'red'}}>This is demo version for a testnet. Contracts are not audited yet.</p>
    <p>
        Donate for:
        <label><input type="radio" name="donateFor" onClick={() => setDonateFor('science')}/> Science and free software</label>
        <label><input type="radio" name="donateFor" onClick={() => setDonateFor('climate')}/> Climate</label>
    </p>
    <p>
        <label>
        <input type="radio" name="paymentKind" onClick={() => setPaymentKind('donate')} checked={paymentKind === 'donate'}/>
        Donate a sum
        </label>
        <label>
        <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestTokens')} checked={paymentKind === 'bequestTokens'}/>
        Donate but allow me to take money back
        </label>
        <label>
        <input type="radio" name="paymentKind" onClick={() => setPaymentKind('bequestGnosis')} checked={paymentKind === 'bequestGnosis'}/>
        Bequest all funds on a Gnosis Safe smart wallet
        </label>
    </p>
    <p style={{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}}>
        Donation in:
        <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc1155')}/> ERC-1155</label>
        <small>(recommended)</small>
        <label><input type="radio" name="tokenKind" onClick={() => setTokenKind('erc20')}/> ERC-20</label>
        <br/>
        <small>(Don't use stablecoins for long-time funding.)</small>
    </p>
    <p>
        <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>Wallet address:</span>
        <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>Token address:</span>
        <Address value={tokenAddress} onChange={async (e: Event) => await setTokenAddress((e.target as HTMLInputElement).value as string)}/>
    </p>
    <p style={{display: paymentKind !== 'bequestGnosis' && tokenKind === 'erc1155' ? 'block' : 'none'}}>
        Token ID:
        <Uint256 value={tokenId} onChange={async (e: Event) => await setTokenId((e.target as HTMLInputElement).value as string)}/>
    </p>
    <p style={{display: paymentKind !== 'donate' ? 'block' : 'none'}}>
        <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
        The donation can be taken back before:
        </span>
        <span style={{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}}>
        The bequest can be taken after:
        </span>
        <span style={{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}}>
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
        <Amount value={amount} onChange={async (e: Event) => await setAmount((e.target as HTMLInputElement).value as string)}/>
        <button onClick={donate} disabled={donateButtonDisabled()}>Donate</button>
        </p>
    </div>
    <p style={{display: paymentKind === 'bequestGnosis' ? 'block' : 'none'}}>
        <button className="donateButton" disabled={bequestButtonDisabled()} onClick={bequestAll}>Bequest!</button>
    </p>
</div>
</template>
