<template>
  <span class="Uint256">
    <input
      type="text"
      maxLength="78"
      size="94"
      v-model="value"
      @input="input"
      @change="change"
      :class="isUint256Valid(this.value) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </span>
</template>

<script>
import Web3 from 'web3'

const { toBN } = Web3.utils;

export default {
  name: 'Uint256',
  props: ['value'],
  data() {
    return {
      error: ''
    }
  },
  methods: {
    isUint256Valid(v) {
      return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)))
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
      this.error = this.isUint256Valid(v) ? '' : 'Invalid 256-bit value'
    }
  },
}
</script>
