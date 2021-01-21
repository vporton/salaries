<template>
  <span class="EthAddress">
    <input
      type="text"
      :value="value"
      @input="input"
      @change="change"
      :class="isRealNumber(this.currentValue) ? '' : 'error'" />
    <!--br />
    <span>{{ error }}</span-->
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
      className: this.isRealNumber(this.value) ? '' : 'error',
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
      const valid =  validators.isRealNumber(v)
      this.className = valid ? '' : 'error'
      this.error = valid ? '' : 'Invalid amount'
    }
  },
}
</script>
