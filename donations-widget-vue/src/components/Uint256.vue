<template>
  <span class="Uint256">
    <input
      type="text"
      maxLength="78"
      size="94"
      :value="value"
      @input="input"
      @change="change"
      :class="isUint256Valid(this.currentValue) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
import validators from '../utils/validators'

export default {
  name: 'Uint256',
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
    isUint256Valid(value) {
      return validators.isUint256Valid(value)
    },
  },
  watch: {
    value(v) {
      this.error = validators.isUint256Valid(v) ? '' : 'Invalid 256-bit value'
    }
  },
}
</script>
