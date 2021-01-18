<template>
  <div>
    <p>
      <small>Free software authors, scientists/inventors, science/software publishers,
        carbon accounters, and other common good producers:</small>
      <br/>
      <a href="/register">Register for a salary.</a>
      <br/>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <p>
      This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe
      anymore, <em>donate or bequest</em> here for the software and the free
      market to choose the best donation recepient.
    </p>
    <p style="color: red">
      This is demo version for a testnet. Contracts are not audited yet.
    </p>
    <p>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="setPaymentKind('donate')"
          checked=""
        />
        &nbsp;Donate
      </label>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="setPaymentKind('bequestGnosis')"
          checked=""
        />
        &nbsp;Bequest all funds on a Gnosis Safe smart wallet
      </label>
    </p>
    <p style="">
      Donation in:
      <label>
        <input
          type="radio"
          name="tokenKind"
          onclick="setTokenKind('erc1155')"
        />
        &nbsp;ERC-1155
      </label>
      <small>(recommended)</small>
      <label>
        <input type="radio" name="tokenKind" onclick="setTokenKind('erc20')" />
        &nbsp;ERC-20
      </label>
      <br />
      <small>(Don't use stablecoins for long-time funding.)</small>
    </p>
    <p>
      <span style="">Wallet address:</span>
      <span style="">Token address:</span>
      <EthAddress
        value=""
        onchange="await setTokenEthAddress(event.target.value)"
      />
    </p>
    <p style="">
      Token ID:
      <Uint256 value="" onchange="await setTokenId(event.target.value)" />
    </p>
    <p style="">
      <span style="">The donation can be taken back before:</span>
      <span style="">The bequest can be taken after:</span>
      <span style=""></span>
      <span style="">
        <br />
        <span style="display: inline-block">
          <!--Calendar onchange="setBequestDate(e)" value="" minDate=""/-->
        </span>
      </span>
    </p>
    <div style="">
      <p>
        Donation amount:
        <Amount value="" onchange="await setAmount(event.target.value)" />
        <button onclick="" disabled="">Donate</button>
      </p>
    </div>
    <p style="">
      <button className="donateButton" disabled="" onclick="bequestAll()">
        Bequest!
      </button>
    </p>
    <p>
      <a rel="noreferrer" target="_blank" href="https://github.com/vporton/donations">
        <img src="img/GitHub-Mark-32px.png" width="32" height="32" alt="Source at GitHub"/>
      </a>
    </p>
  </div>
</template>

<script>
import EthAddress from '@/components/EthAddress.vue'

export default {
  name: 'Donate',
  components: {
    EthAddress
  }
}
</script>
