<template>
  <span class="EthAddress">
    <input
      type="text"
      v-model="value"
      @input="input"
      @change="change"
      :class="isRealNumber(this.value) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
export default {
  name: 'Amount',
  props: ['value'],
  data() {
    return {
      error: ''
    }
  },
  methods: {
    isRealNumber(value) {
      return /^[0-9]+(\.[0-9]+)?$/.test(value)
    },
    input(v) {
      this.$emit('input', v)
    },
    change(v) {
      this.$emit('change', v)
    }
  },
  watch: {
    value(v) {
      this.error = this.isValidAddress(v) ? '' : 'Invalid amount'
    }
  },
}
</script>

<style>
span {
  color: red;
}
</style>
