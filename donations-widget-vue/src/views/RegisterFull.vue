<template>
  <div>
    <p>
        <router-link to="/">Donate/bequest for science, free software, or climate.</router-link>
        <br/> 
        <small>Just bequest all your funds here.</small>
    </p>
    <Register/>
  </div>
</template>

<script>
import Register from './Register';

export default {
  name: 'RegisterFull',
  components: {
    Register,
  },
}
</script>
