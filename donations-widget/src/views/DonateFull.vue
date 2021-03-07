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
        (the common goods DAO - donate to it)
      </small>
      {{' '}}
      <button
        :style="{display: currentOracleId !== mainOracleId ? 'inline' : 'none'}"
        @click="currentOracleId = mainOracleId"
      >
        Go to the common goods DAO
      </button>
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
  </div>
</template>

<script>
// import Vue from 'vue';
import { getAddresses } from '../utils/AppLib'
import Donate from './Donate';
import Connect from '@/components/Connect.vue'
import DonateForApp from '@/components/DonateForApp.vue'

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
    }
  },
  components: {
    Donate,
    Connect,
    DonateForApp,
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
  },
}
</script>
