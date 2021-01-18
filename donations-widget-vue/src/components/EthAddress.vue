<template>
  <span class="EthAddress">
    <input
      type="text"
      maxLength="42"
      size="50"
      :value="value"
      @input="input"
      @change="change"
      :class="isEthAddressValid(this.currentValue) ? '' : 'error'" />
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
      currentValue: this.value,
      error: '',
    }
  },
  methods: {
    input(event) {
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
