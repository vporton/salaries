<template>
  <div>
    <p style="float: right">
      <Connect
        ref="connector"
        :networkname="this.networkname"
        :providerurl="this.providerurl"
        @changenetworkname="currentNetworkname = $event"
      />
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
      :networkname="this.currentNetworkname"
      :providerurl="this.providerurl"
      :web3Getter="web3Getter"
    />
  </div>
</template>

<script>
import Donate from './Donate';
import Connect from '@/components/Connect.vue'

export default {
  name: 'DonateFull',
  props: [
    'prefix',
    'chainid',
    'networkname',
    'providerurl',
  ],
  data() {
    return {
      currentNetworkname: this.networkname,
    }
  },
  components: {
    Donate,
    Connect,
  },
  methods: {
    async web3Getter() {
      await this.$refs.connector.baseGetWeb3()
      this.currentNetworkname = this.$refs.connector.currentNetworkname
      return this.$refs.connector.web3
    },
  },
}
</script>
