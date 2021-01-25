<template>
  <div>
    <p style="float: right">
      <Disconnect :networkname="this.networkname" :providername="this.providername"/>
    </p>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register :prefix="this.prefix" :chainid="this.chainid" :networkname="this.networkname" :providername="this.providername" :initialconditionid="this.initialconditionid"/>
  </div>
</template>

<script>
import Register from './Register';
import Disconnect from '@/components/Disconnect.vue'

export default {
  name: 'RegisterFull',
  props: [
    'prefix',
    'chainid',
    'networkname',
    'providername',
    'initialconditionid',
  ],
  components: {
    Register,
    Disconnect,
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
