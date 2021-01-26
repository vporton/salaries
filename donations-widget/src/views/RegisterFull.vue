<template>
  <div>
    <p style="float: right">
      <Connect
        :networkname="this.networkname"
        :providername="this.providername"
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
      :providername="this.providername"
      :initialconditionid="this.initialconditionid"
      :web3="this.web3"
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
    'providername',
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
}

function onConditionCreated(/*conditionId*/) {
  // TODO: Show a HTML dialog.
  // alert(`Your condition ID is ${conditionId}. Write it down.`)
}
</script>
