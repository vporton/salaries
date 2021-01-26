<template>
  <div>
    <p style="float: right">
      <Connect
        :networkname="this.networkname"
        :providername="this.providername"
        @change="web3 = $event"
        @change-networkname="$refs.donate.networkname = $event"
      />
    </p>
    <p>
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
      :networkname="this.networkname"
      :providername="this.providername"
      :web3="this.web3"
    />
  </div>
</template>

<script>
import Donate from './Donate';
import Connect from '@/components/Connect.vue'

export default {
  name: 'DonateFull',
  props: ['prefix', 'chainid', 'networkname', 'providername'],
  data() {
    return {
      web3: null,
    }
  },
  components: {
    Donate,
    Connect,
  },
}
</script>
