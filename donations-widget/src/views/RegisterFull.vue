<template>
  <div>
    <div style="float: right; margin: 8px">
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
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register
      ref="register"
      :prefix="this.prefix"
      :chainid="this.chainid"
      :oracleid="this.oracleid"
      :networkname="this.currentNetworkname"
      :providerurl="this.providerurl"
      :initialconditionid="this.initialconditionid"
      :web3Getter="web3Getter"
    />
  </div>
</template>

<script>
// import Vue from 'vue';
import Register from './Register';
import Connect from '@/components/Connect.vue'
import DonateForApp from '@/components/DonateForApp.vue'

export default {
  name: 'RegisterFull',
  props: [
    'prefix',
    'chainid',
    'oracleid',
    'networkname',
    'providerurl',
    'initialconditionid',
  ],
  data() {
    return {
      web3: null,
      currentNetworkname: this.networkname,
    }
  },
  components: {
    Register,
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
      this.$emit('changenetworkname', $event);
    },
  },
}
</script>
