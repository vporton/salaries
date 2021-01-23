<template>
  <span class="EthAddress">
    <input
      type="text"
      maxLength="42"
      size="50"
      :value="currentValue"
      @input="input"
      @change="change"
      :class="className" />
    <!--br />
    <span>{{ error }}</span-->
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
      className: this.isEthAddressValid(this.value) ? '' : 'error',
      error: '',
    }
  },
  methods: {
    input(event) {
      this.currentValue = event.target.value;
      this.$emit('input', event.target.value)
    },
    change(event) {
      this.currentValue = event.target.value;
      this.$emit('change', event.target.value)
    },
    isEthAddressValid(value) {
      return validators.isEthAddressValid(value)
    }
  },
  watch: {
    value(v) {
      this.currentValue = v;
    },
    currentValue(v) {
      const valid = validators.isEthAddressValid(v)
      this.className = valid ? '' : 'error'
      this.error = valid ? '' : 'Invalid Ethereum address'
    },
  },
}
</script>
