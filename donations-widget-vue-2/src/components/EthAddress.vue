<template>
  <div>
      <input
        type="text"
        maxLength="42"
        size="50"
        v-model="address"
      />
      <br />
      <span>{{ error }}</span>
  </div>
</template>

<script>
import Web3 from 'web3'

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

export default {
  name: 'EthAddress',
  data() {
    return {
      address: '',
      error: ''
    }
  },
  methods: {
    isValidAddress(address) {
      this.error = web3.utils.isAddress(address) ? '' : 'Invalid Ethereum address'
    }
  },
  watch: {
    address(value){
      this.address = value;
      this.isValidAddress(value);
    }
  },
}

</script>

<style>
span {
  color: red;
}
</style>
