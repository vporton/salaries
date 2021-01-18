<template>
  <span class="EthAddress">
    <input
      type="text"
      maxLength="42"
      size="50"
      :value="value"
      @input="input"
      @change="change"
      :class="isEthAddressValid(this.value) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
import validators from '../utils/validators'

export default {
  name: 'EthAddress',
  props: ['value'],
  data() {
    return {
      error: ''
    }
  },
  methods: {
    input(event) {
      console.log(event.target.value)
      this.$emit('input', event.target.value)
    },
    change(event) {
      this.$emit('change', event.target.value)
    },
    isEthAddressValid(value) {
      return validators.isEthAddressValid(value)
    }
  },
  watch: {
    value(v) {
      this.error = validators.isEthAddressValid(v) ? '' : 'Invalid Ethereum address'
    }
  },
}
</script>
