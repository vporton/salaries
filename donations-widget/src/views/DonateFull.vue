<template>
  <div>
    <p style="float: right">
      <Disconnect :networkname="this.networkname" :providername="this.providername"/>
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
    <Donate :prefix="this.prefix" :chainid="this.chainid" :networkname="this.networkname" :providername="this.providername"/>
  </div>
</template>

<script>
import Donate from './Donate';
import Disconnect from '@/components/Disconnect.vue'

export default {
  name: 'DonateFull',
  props: ['prefix', 'chainid', 'networkname', 'providername'],
  components: {
    Donate,
    Disconnect,
  },
}
</script>
