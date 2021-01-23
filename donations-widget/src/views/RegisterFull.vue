<template>
  <div>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register :prefix="this.prefix" :initialconditionid="this.initialconditionid"/>
  </div>
</template>

<script>
import Register from './Register';

export default {
  name: 'RegisterFull',
  props: [
    'prefix',
    'initialconditionid',
  ],
  components: {
    Register,
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
