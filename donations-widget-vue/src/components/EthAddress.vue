<template>
  <span class="EthAddress">
    <input
      type="text"
      maxLength="42"
      size="50"
      v-model="value"
      @input="input"
      @change="change"
      :class="isValidAddress(this.value) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
import Web3 from 'web3'

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545") // hack

export default {
  name: 'EthAddress',
  props: ['value'],
  data() {
    return {
      error: ''
    }
  },
  methods: {
    isValidAddress(value) {
      return web3.utils.isAddress(value)
    },
    input(v) {
      this.$emit('input', v)
    },
    change(v) {
      this.$emit('change', v)
    },
  },
  watch: {
    value(v) {
      this.error = this.isValidAddress(v) ? '' : 'Invalid Ethereum address'
    }
  },
}
</script>
