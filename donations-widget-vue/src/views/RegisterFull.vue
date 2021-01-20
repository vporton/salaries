<template>
  <div>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register :oracleId="this.oracleId"/>
  </div>
</template>

<script>
import Register from './Register';

export default {
  name: 'RegisterFull',
  props: ['oracleId'],
  components: {
    Register,
  },
}
</script>
