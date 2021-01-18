<template>
  <span class="EthAddress">
    <input
      type="text"
      :value="value"
      @input="input"
      @change="change"
      :class="isRealNumber(this.currentValue) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
import validators from '../utils/validators'

export default {
  name: 'Amount',
  props: ['value'],
  data() {
    return {
      currentValue: this.value,
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
    isRealNumber(value) {
      return validators.isRealNumber(value)
    },
  },
  watch: {
    value(v) {
      this.error = validators.isRealNumber(v) ? '' : 'Invalid amount'
    }
  },
}
</script>
