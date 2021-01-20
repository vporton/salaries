<template>
  <div>
    <p>
      <small>Free software authors, scientists/inventors, science/software publishers,
        carbon accounters, and other common good producers:</small>
      <br/>
      <router-link to="/register">Register for a salary.</router-link>
      <br/>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <Donate/>
  </div>
</template>

<script>
import Donate from './Donate';

export default {
  name: 'DonateFull',
  components: {
    Donate,
  },
}
</script>
