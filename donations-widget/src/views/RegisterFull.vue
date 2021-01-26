<template>
  <div>
    <p style="float: right">
      <Connect
        ref="connector"
        :networkname="this.networkname"
        :providerurl="this.providerurl"
        @change="web3 = $event"
        @change-networkname="$refs.register.networkname = $event"
      />
    </p>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register
      ref="register"
      :prefix="this.prefix"
      :chainid="this.chainid"
      :networkname="this.networkname"
      :providerurl="this.providerurl"
      :initialconditionid="this.initialconditionid"
      :web3Getter="web3Getter"
    />
  </div>
</template>

<script>
import Register from './Register';
import Connect from '@/components/Connect.vue'

export default {
  name: 'RegisterFull',
  props: [
    'prefix',
    'chainid',
    'networkname',
    'providerurl',
    'initialconditionid',
  ],
  data() {
    return {
      web3: null,
    }
  },
  components: {
    Register,
    Connect,
  },
  mounted() {
    // Hack
    window.registerComponent.addRegisterCallback(onConditionCreated);
  },
  methods: {
    async web3Getter() {
      await this.$refs.connector.connectAsync()
      console.log(this.$refs.connector.providerurl)  
      this.providerurl = this.$refs.connector.providerurl
      this.networkname = this.$refs.connector.networkname
    }
  },
}

function onConditionCreated(/*conditionId*/) {
  // TODO: Show a HTML dialog.
  // alert(`Your condition ID is ${conditionId}. Write it down.`)
}
</script>
