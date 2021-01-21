<template>
  <div>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register :prefix="this.prefix"/>
  </div>
</template>

<script>
import Register from './Register';

export default {
  name: 'RegisterFull',
  props: ['prefix'],
  components: {
    Register,
  },
}
</script>
