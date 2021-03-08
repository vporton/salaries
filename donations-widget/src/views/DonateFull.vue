<template>
  <div style="margin-bottom: 10px">
    <div style="float: right">
      <Connect
        ref="connector"
        :networkname="this.networkname"
        :providerurl="this.providerurl"
        @changenetworkname="onChangeNetworkName($event)"
      />
    </div>
    <div style="float: left">
      <DonateForApp/>
    </div>
    <p :style="{clear: 'both'}">
      <small>Free software authors, scientists/inventors, science/software publishers,
        carbon accounters, and other common good producers:</small>
      <br/>
      <router-link to="/register">Register for a salary.</router-link>
      <br/>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <p :style="{textAlign: 'center'}">
      <small>Oracle ID:</small>
      {{' '}}
      <input type="numeric" v-model="currentOracleId" style="width: 5em"/>
      <small :style="{display: currentOracleId && currentOracleId === mainOracleId ? 'inline' : 'none'}">
        (the common goods DAO oracle - donate to it)
      </small>
      {{' '}}
      <button
        :style="{display: currentOracleId !== mainOracleId ? 'inline' : 'none'}"
        @click="currentOracleId = mainOracleId"
      >
        Go to the common goods DAO
      </button>
      <br/>
      <small><a href="#" @click.prevent="createOracleDialog">Create a new oracle</a> (a service for businesses and search engines)</small>
    </p>
    <Donate
      ref="donate"
      :prefix="this.prefix"
      :chainid="this.chainid"
      :oracleid="this.currentOracleId"
      :networkname="this.currentNetworkname"
      :providerurl="this.providerurl"
      :web3Getter="web3Getter"
    />
    <vue-modal-2
      ref="oracleDataDialog"
      name="oracleDataDialog"
      @on-close="closeOracleDialog"
      :headerOptions="{
        title: 'Create oracle.',
      }"
      :footerOptions="{
        btn1: 'Close',
        btn2: 'Create',
        btn1OnClick: () => {
          this.closeOracleDialog();
        },
        btn2OnClick: () => {
          this.createOracle();
        },
        // disableBtn2: true, // TODO: @burhanahmeed/vue-modal-2 doesn't support enabling it later.
      }"
    >
      <p :style="{padding: '1ex'}">Oracle owner: <EthAddress :value="oracleOwner" @input="oracleOwner = $event"/></p>
    </vue-modal-2>
    <vue-modal-2
      name="oracleBeingCreated"
      @on-close="oracleBeingCreatedDialog"
      :headerOptions="{
        title: 'An oracle is being created.',
      }"
      :footerOptions="{
        btn1: 'Close',
        btn2Style: {
          display: 'none',
        },
        btn1OnClick: () => {
          $vm2.close('oracleBeingCreated');
        },
      }"
    >
      <p>Don't close the window.</p> <!-- TODO: Prevent closing browser window. -->
    </vue-modal-2>
  </div>
</template>

<script>
// import Vue from 'vue';
import { getAddresses } from '../utils/AppLib'
import Donate from './Donate';
import Connect from '@/components/Connect.vue'
import DonateForApp from '@/components/DonateForApp.vue'
import EthAddress from '@/components/EthAddress.vue'
import validators from '../utils/validators'
import { mySend, getABIs, getAccounts } from '../utils/AppLib'

export default {
  name: 'DonateFull',
  props: [
    'prefix',
    'chainid',
    'oracleid',
    'networkname',
    'providerurl',
  ],
  data() {
    return {
      web3: null,
      currentNetworkname: this.networkname,
      currentOracleId: this.oracleid,
      mainOracleId: null,
      oracleOwner: "",
    }
  },
  components: {
    Donate,
    Connect,
    DonateForApp,
    EthAddress,
  },
  created() {
    this.updateMainOracleId()
  },
  methods: {
    async web3Getter() {
      await this.$refs.connector.baseGetWeb3()
      this.currentNetworkname = this.$refs.connector.currentNetworkname
      return this.$refs.connector.web3
    },
    onChangeNetworkName($event) {
      this.currentNetworkname = $event
      this.$emit('changenetworkname', $event);
    },
    updateMainOracleId() {
      const self = this
      async function doIt() {
        const abis = await self.myGetAddresses(self.prefix)
        self.mainOracleId = abis ? abis.oracleId : null
      }
      doIt()
    },
    async myGetAddresses(PREFIX) {
      return await getAddresses(PREFIX, this.networkname)
    },
    async createOracleDialog() {
      const web3 = await this.getWeb3();
      this.oracleOwner = (await getAccounts(web3))[0]
      this.$vm2.open('oracleDataDialog');
    },
    async createOracle() {
      const self = this
      console.log('self.oracleOwner', self.oracleOwner)
      if (!validators.isEthAddressValid(self.oracleOwner) || !self.oracleOwner) {
        alert("Wrong owner address!")
        return
      }
      self.$vm2.close('oracleDataDialog');
      const web3 = await this.getWeb3();
      const account = (await getAccounts(web3))[0];
      if (web3 && account !== undefined) {
        const addresses = await self.myGetAddresses(this.prefix);
        if (!addresses) return;
        const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
        console.log('xxx', self.oracleOwner)
        try {
          self.$vm2.open('oracleBeingCreated');
          const tx = await mySend(
            await self.getWeb3(),
            science,
            science.methods.createOracle,
            [self.oracleOwner],
            {from: account},
            null);
          const txData = await tx;
          this.$vm2.close('oracleBeingCreated');
          self.currentOracleId = txData.events.OracleCreated.returnValues.oracleId;
          console.log('oracleId:', self.oracleId);
        }
        catch(e) {
          this.$vm2.close('oracleBeingCreated');
          alert(e.message);
        }
      }
    },
    closeOracleDialog() {
      this.$vm2.close('oracleDataDialog');
    },
    oracleBeingCreatedDialog() {
      this.$vm2.close('oracleBeingCreated')
    },
    async getWeb3() {
      return this.web3 = this.web3Getter ? await this.web3Getter() : window.web3 // Duplicate code
    },
  },
  watch: {
    oracleid() {
      this.currentOracleId = this.oracleid
    },
    currentOracleId() {
      this.$emit('changeoracleid', this.currentOracleId)
    },
    currentNetworkname() {
      this.updateMainOracleId()
    },
//    oracleOwner() {
//      // This doesn't work due to a @burhanahmeed/vue-modal-2 bug:
//      this.$refs.createOracleDialog.footerOptions.disableBtn2 = !validators.isEthAddressValid(this.oracleOwner)
//    },
  },
}
</script>
