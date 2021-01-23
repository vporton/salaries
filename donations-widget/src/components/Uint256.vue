<template>
  <span class="Uint256">
    <input
      type="text"
      maxLength="78"
      :size="this.size ? this.size : 94"
      :value="currentValue"
      @input="input"
      @change="change"
      :class="isUint256Valid(this.currentValue) ? '' : 'error'" />
    <!--br />
    <span>{{ error }}</span-->
  </span>
</template>

<script>
import validators from '../utils/validators'

export default {
  name: 'Uint256',
  props: ['value', 'size'],
  data() {
    return {
      currentValue: this.value,
      className: this.isUint256Valid(this.value) ? '' : 'error',
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
      this.currentValue = v;
    },
    currentValue(v) {
      const valid = validators.isUint256Valid(v)
      this.className = valid ? '' : 'error'
      this.error = valid ? '' : 'Invalid 256-bit number'
    }
  },
}
</script>
