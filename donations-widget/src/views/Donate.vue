<template>
  <div>
    <p>
      <small>
        <span style="color: red">No warranty!</span> Not all smart contracts were audited.
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/vporton/future-contracts/raw/master/docs/Audit-TechRate.pdf"
        >
          Audit report.
        </a>
      </small>
    </p>
    <p>
      This is <strong>the</strong> donation app. <em>Donate and/or bequest</em> here for the software and the free
      market to choose the best donation recipients.
    </p>
    <NetworkInfo :chainid="chainid" :networkname="networkname" :web3="web3"/>
    <p>
      <label>
        <input
          type="radio"
          name="paymentKind"
          @click="setPaymentKind('donate')"
          checked=""
        />
        &nbsp;Donate
      </label>
      <label>
        <input
          type="radio"
          name="paymentKind"
          @click="setPaymentKind('bequestSafe')"
          checked=""
        />
        &nbsp;Bequest all funds on a smart wallet
      </label>
    </p>
    <p :style="{display: tokenDisplayBlock}">
      Donation in:
      <label>
        <input
          type="radio"
          name="tokenKind"
          @click="setTokenKind('eth')"
        />
        &nbsp;{{gasToken}}
      </label>
      <small>(recommended)</small>
      {{' '}}
      <label>
        <input
          type="radio"
          name="tokenKind"
          @click="setTokenKind('erc1155')"
        />
        &nbsp;ERC-1155
      </label>
      <small>(recommended)</small>
      {{' '}}
      <label>
        <input type="radio" name="tokenKind" @click="setTokenKind('erc20')" />
        &nbsp;ERC-20
      </label>
      {{' '}}
      <label>
        <input type="radio" name="tokenKind" @click="setTokenKind('erc721')" />
        &nbsp;ERC-721
      </label>
      <span :style="{display: networkname && networkname.toLowerCase() !== 'xdai' ? 'inline' : 'none'}">
        <br/>
        <button @click="initCardProcessing">Donate by credit card</button>
      </span>
      <br />
      <small :style="{display: tokenKind != 'eth' && tokenKind !== 'erc721' ? 'inline' : 'none'}">
        Don't use stablecoins for long-time funding.
      </small>
      <small :style="{display: tokenKind === 'erc1155' || tokenKind === 'erc721' ? 'inline' : 'none'}">
        You can donate expensive pictures or <a target="_blank" href="https://galtproject.io">real estate</a>.
      </small>
    </p>
    <p :style="{display: tokenDisplayInline}">
      <span>Token address:</span>
      {{' '}}
      <EthAddress v-model="tokenEthAddress"/>
      <br/>
      <small>Note that we do support DeFi tokens as donations.</small>
    </p>
    <p :style="{display: walletDisplayInline}">
      Gnosis Safe address:
      {{' '}}
      <EthAddress v-model="safeAddress"/>
      <br/>
      <small>
        <a
          rel="noopener noreferrer"
          :href="`https://${this.networkname}.gnosis-safe.io/app/#/open`"
        >Create a new safe!</a> |
        <a 
          rel="noopener noreferrer"
          href="#"
          @click.prevent="copyBequestAppToClipboard"
        >The Bequest app for Gnosis Safe</a> (click to copy)
      </small>
      <br/>
      <small>
        Our system can take all {{gasToken}}, ERC-20, ERC-721, and ERC-1155 tokens (and nothing other) from your safe.<br/>
        Please put there money, DeFi/shares, expensive pictures, <a target="_blank" href="https://galtproject.io">real estate</a>, etc.
      </small>
      <br/>
      <!--small :style="{color: 'red'}">Bequests are supported only on xDai network.</small>
      <br/-->
      <button
        target="_blank"
        rel="noopener noreferrer"
        @click="bequest"
        :disabled="bequestDisabled"
        class="donateButton"
      >
        Bequest all funds on a Gnosis Safe
      </button>
    </p>
    <p :style="{display: paymentKind !== 'bequestSafe' && tokenKind === 'erc1155' || tokenKind === 'erc721' ? 'block' : 'none'}">
      Token ID:
      <Uint256 v-model="tokenId"/>
    </p>
    <div :style="{display: tokenDisplayBlock}">
      <p>
        <span :style="{display: this.tokenKind === 'erc721' ? 'none' : 'inline'}">
          Donation amount:
          <Amount v-model="amount"/>
          {{' '}}
        </span>
        <button @click="donate()" :disabled="donateButtonDisabled">Donate</button>
      </p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Web3 from 'web3';
import VueClipboard from 'vue-clipboard2'
// MEWConnect does not work on Firefox 84.0 for Ubuntu.
// import Web3Modal from "web3modal";
// import MewConnect from '@myetherwallet/mewconnect-web-client';
import transakSDK from '@transak/transak-sdk'

import validators from '../utils/validators'

const { toBN, toWei } = Web3.utils;

import { compositeTokenHash } from '@vporton/wrap-tokens/lib/tokens-ethers'

import EthAddress from '@/components/EthAddress.vue'
import Uint256 from '@/components/Uint256.vue'
import Amount from '@/components/Amount.vue'
import NetworkInfo from '@/components/NetworkInfo.vue'
import { mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'

import erc1155Abi from '../utils/ERC1155Abi';
import erc20Abi from '../utils/ERC20Abi';
import erc721Abi from '../utils/ERC721Abi';

Vue.use(VueClipboard)

export default {
  name: 'Donate',
  props: [
    'prefix',
    'chainid',
    'networkname',
    'providerurl',
    'web3Getter',
  ],
  components: {
    EthAddress,
    Uint256,
    Amount,
    NetworkInfo,
  },
  watch: {
    amount() {
      this.setDonateButtonDisabled();
    },
    paymentKind() {
      this.setDonateButtonDisabled();
      this.updateWalletTokenDisplay();
    },
    tokenKind() {
      this.setDonateButtonDisabled();
      this.updateWalletTokenDisplay();
    },
    tokenEthAddress() {
      this.setDonateButtonDisabled();
    },
    tokenId() {
      this.setDonateButtonDisabled();
    },
    safeAddress() {
      this.setBequestURI();
    },
    gnosisBequestApp() {
      this.setBequestURI();
    },
    networkname() {
      const self = this
      switch(this.networkname) {
        case 'bsc':
        case 'bsctest':
          self.gasToken = 'BNB'
          break
        case 'xdai':
          self.gasToken = 'XDAI'
          break
        case 'matic':
        case 'mumbai':
          self.gasToken = 'MATIC'
          break
        default:
          self.gasToken = 'ETH'
          break
      }
      async function doIt() {
        self.web3 = self.web3Getter ? await self.web3Getter() : window.web3 // Duplicate code
        const abis = await self.myGetAddresses(self.prefix);
        self.oracleId = abis ? abis.oracleId : null;
        self.gnosisBequestApp = abis ? abis.gnosisBequestApp : null; // FIXME: Use the same app for all networks.
      }
      doIt();
    },
  },
  data() {
    return {
      web3: null,

      oracleId: null, // TODO: should be a property instead

      paymentKind: 'bequestSafe',
      tokenKind: '',
      tokenEthAddress: '',
      tokenId: '',
      amount: '',
      safeAddress: '',
      gnosisBequestApp: null,
      gnosisBequestAppInSafe: '',
      donateButtonDisabled: true,
      bequestDisabled: true,
      gasToken: 'ETH',
      
      // TODO: too many:
      walletDisplayInline: 'inline',
      walletDisplayBlock: 'block',
      tokenDisplayInline: 'none',
      tokenDisplayBlock: 'none',
    }
  },
  created() {
    const self = this
    self.myGetAddresses(self.prefix)
      .then(function(abis) {
        if (abis) {
          self.oracleId = abis.oracleId
        }
      })

    window.donateComponent = self // bug workaround used in GitCoin
  },
  methods: {
    async initCardProcessing() {
      // TODO: Don't allow if DonateETH isn't deployed.
      const production = this.networkname == 'mainnet' || this.networkname == 'bsc' || this.networkname === 'matic'; // TODO
      const donationAddress = (await this.myGetAddresses(this.prefix)).DonateETH.address;
      const transak = new transakSDK({
          apiKey: production ? 'cee43b4a-4bba-4b69-96b1-01032f9e8a49' : '1080530b-8cfd-4e16-85e8-880a92aecbb3',
          environment: production ? 'PRODUCTION' : 'STAGING',
          cryptoCurrencyCode: this.gasToken, // TODO: Make possible use other tokens
          //defaultCryptoCurrency: this.gasToken,
          networks: this.networkname,
          walletAddress: donationAddress,
          disableWalletAddressForm: true,
          exchangeScreenTitle: "Donate for common goods",
          themeColor: '000000', // App theme color
          fiatCurrency: '', // INR/GBP
          redirectURL: '',
          hostURL: window.location.origin,
          widgetHeight: `${Math.min(document.body.clientHeight, 650)}px`, // FIXME: Make it work well both on PC and phone.
//          widgetWidth: '450px',
          hideMenu: true,
          //isDisableCrypto: true,
      });

      transak.init();

      // To get all the events
      transak.on(transak.ALL_EVENTS, (data) => {
          console.log(data)
      });

      // This will trigger when the user marks payment is made.
      transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
          console.log(orderData);
          transak.close();
      });
    },
    async myGetAddresses(PREFIX) {
      return await getAddresses(PREFIX, this.networkname)
    },
    async obtainERC1155Token() {
      let collateralContractEthAddress, collateralTokenId;
      switch(this.tokenKind) {
        case 'erc1155':
          collateralContractEthAddress = this.tokenEthAddress;
          collateralTokenId = this.tokenId;
          break;
        case 'erc20':
          collateralContractEthAddress = (await this.myGetAddresses(this.prefix)).ERC1155OverERC20.address;
          collateralTokenId = Web3.utils.toHex(this.tokenEthAddress);

          {
            const web3 = await this.getWeb3();
            // if (web3 === null) return;
            const account = (await getAccounts(web3))[0];
            // if(!account) return;

            // Approve ERC-20 spent
            const erc20 = new web3.eth.Contract(erc20Abi, this.tokenEthAddress);
            const allowanceStr = await erc20.methods.allowance(account, collateralContractEthAddress).call();
            const allowance = toBN(allowanceStr);
            const halfBig = toBN(2).pow(toBN(128));
            if(allowance.lt(halfBig)) {
              const big = toBN(2).pow(toBN(256)).sub(toBN(1));
              const tx = await mySend(await this.getWeb3(), erc20, erc20.methods.approve, [collateralContractEthAddress, big.toString()], {from: account}, null)
                // .catch(e => alert(e.message));
              await tx;
            }
          }
          break;
        case 'erc721':
          collateralContractEthAddress = (await this.myGetAddresses(this.prefix)).ERC1155OverERC721.address;

          {
            const web3 = await this.getWeb3();
            // if (web3 === null) return;
            const account = (await getAccounts(web3))[0];
            // if(!account) return;

            const ourAbi = (await getABIs(this.prefix)).ERC1155OverERC721;
            const erc1155 = new web3.eth.Contract(ourAbi, collateralContractEthAddress);
            const erc721 = new web3.eth.Contract(erc721Abi, this.tokenEthAddress);

            collateralTokenId = compositeTokenHash(this.tokenEthAddress, this.tokenId);
            const erc1155Info = await erc1155.methods.tokens(collateralTokenId).call();

            // TODO: Don't transact if you are not owner of `this.tokenEthAddress`/`this.tokenId`.

            if(/^0x0+$/.test(erc1155Info.erc721Contract)) {
              const tx = await mySend(await this.getWeb3(), erc1155, erc1155.methods.registerERC721Token, [{erc721Contract: this.tokenEthAddress, erc721TokenId: this.tokenId}], {from: account}, null)
                // .catch(e => alert(e.message));
              await tx;
            }

            // Approve ERC-721 spent
            const approved = await erc721.methods.isApprovedForAll(this.tokenEthAddress, collateralContractEthAddress).call();
            if(!approved) {
              const tx = await mySend(await this.getWeb3(), erc721, erc721.methods.setApprovalForAll, [collateralContractEthAddress, true], {from: account}, null)
                // .catch(e => alert(e.message));
              await tx;
            }
          }
          break;
      }
      return [collateralContractEthAddress, collateralTokenId];
    },
    async lockContract() {
      const addresses = await this.myGetAddresses(this.prefix);
      return addresses.SalaryWithDAO.address;
    },
    setBequestURI() {
      this.bequestDisabled = !validators.isEthAddressValid(this.safeAddress);
      const safeUI = `https://${this.networkname}.gnosis-safe.io/app/#/safes/${this.safeAddress}`;
      this.gnosisBequestAppInSafe =
        `${safeUI}/apps?appUrl=` + window.encodeURIComponent(this.gnosisBequestApp);
    },
    async donateETH() {
      const wei = toWei(this.amount);
      const web3 = await this.getWeb3();
      if (web3 !== null) {
        try {
          const contractAddress = (await this.myGetAddresses(this.prefix)).DonateETH.address;
          const abi = (await getABIs(this.prefix)).DonateETH;
          const contract = new web3.eth.Contract(abi, contractAddress);
          const account = (await getAccounts(web3))[0];
          if(!account) {
            // setConnectedToAccount(false); // TODO
            return;
          }
          await mySend(await this.getWeb3(), contract, contract.methods.donate,
            [this.oracleId,
             account,
             []],
            {from: account, value: wei}, null
          );
        }
        catch(e) {
          alert(e.message);
        }
      }
    },
    async donateToken() {
      const wei = this.tokenKind === 'erc721' ? 1 : toWei(this.amount);
      const web3 = await this.getWeb3();
      if (web3 !== null) {
        try {
          const addresses = await this.myGetAddresses(this.prefix);
          if (!addresses) return;
          const contractAddress = await this.lockContract();
          const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
          const account = (await getAccounts(web3))[0];
          if(!account) {
            // setConnectedToAccount(false); // TODO
            return;
          }
          const [collateralContractAddress, collateralTokenId] = await this.obtainERC1155Token();
          const collateralContract = new web3.eth.Contract(erc1155Abi, collateralContractAddress);
          const approved = await collateralContract.methods.isApprovedForAll(account, contractAddress).call();
          if (!approved) {
            const tx = await mySend(
              await this.getWeb3(), collateralContract, collateralContract.methods.setApprovalForAll,
              [contractAddress, true], {from: account}, null
            );
            await tx;
          }
          await mySend(await this.getWeb3(), science, science.methods.donate,
            [collateralContractAddress,
             collateralTokenId,
             this.oracleId,
             wei,
             account,
             account,
             []],
            {from: account}, null
          );
        }
        catch(e) {
          alert(e.message);
        }
      }
    },
    async donate() {
      if (this.tokenKind === 'eth') {
        this.donateETH();
      } else {
        this.donateToken();
      }
    },
    setDonateButtonDisabled() {
      this.donateButtonDisabled =
        (!validators.isRealNumber(this.amount) && this.tokenKind !== 'erc721') ||
        this.paymentKind === '' || this.tokenKind === '' ||
        (this.tokenKind !== 'eth' && !validators.isEthAddressValid(this.tokenEthAddress)) ||
        ((this.tokenKind === 'erc1155' || this.tokenKind === 'erc721') && !validators.isUint256Valid(this.tokenId));
    },
    setPaymentKind(value) {
      this.paymentKind = value;
    },
    setTokenKind(value) {
      this.tokenKind = value;
    },
    setTokenEthAddress(value) {
      this.tokenEthAddress = value;
    },
    setTokenId(value) {
      this.tokenId = value;
    },
    setAmount(value) {
      this.value = value;
    },
    updateWalletTokenDisplay() {
      this.walletDisplayInline = this.paymentKind === 'bequestSafe' ? 'inline' : 'none'
      this.walletDisplayBlock = this.paymentKind === 'bequestSafe' ? 'block' : 'none'
      this.tokenDisplayInline = this.paymentKind !== 'bequestSafe' && this.tokenKind !== 'eth'
        ? 'inline' : 'none'
      this.tokenDisplayBlock = this.paymentKind !== 'bequestSafe' ? 'block' : 'none'
    },
    isPastDate(date) {
      const currentDate = new Date();
      return date < currentDate;
    },
    bequest() {
      window.open(this.gnosisBequestAppInSafe);
    },
    copyBequestAppToClipboard() {
      const self = this
      async function doIt() {
        const abis = await self.myGetAddresses(self.prefix);
        console.log("QQ", abis.gnosisBequestApp)
        self.$copyText(abis.gnosisBequestApp).then(() => window.alert('URL copied to clipboard.'))
      }
      doIt()
    },
    async getWeb3() {
      return this.web3 = this.web3Getter ? await this.web3Getter() : window.web3 // Duplicate code
    },
  },
}
</script>

<style src="../assets/Donate.css"></style>
