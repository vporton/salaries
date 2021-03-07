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
    <p :style="{textAlign: 'center'}">
      <small>Oracle ID:</small>
      {{' '}}
      <input type="numeric" ref="oracleId"/>
    </p>
    <p :style="{clear: 'both'}">
      <small>Free software authors, scientists/inventors, science/software publishers,
        carbon accounters, and other common good producers:</small>
      <br/>
      <router-link to="/register">Register for a salary.</router-link>
      <br/>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
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
    }
  },
  components: {
    Donate,
    Connect,
    DonateForApp,
  },
  methods: {
    async web3Getter() {
      await this.$refs.connector.baseGetWeb3()
      this.currentNetworkname = this.$refs.connector.currentNetworkname
      return this.$refs.connector.web3
    },
    onChangeNetworkName($event) {
      this.currentNetworkname = $event
      console.log("OOOOOOOOOOOOOOO", this.currentNetworkname)
      this.$emit('changenetworkname', $event);
    },
  },
}
</script>
