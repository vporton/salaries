<template>
  <div class="Uint256">
    <input
        type="text"
        maxLength="78"
        size="94"
        v-model="value"
        v-on:change="$emit('change')"
        v-bind:class="isUint256Valid(props.value) ? '' : 'error'" />
    <br />
    <span>{{ error }}</span>
  </div>
</template>

<script>
import Web3 from 'web3'

const { toBN } = Web3.utils;

export default {
  name: 'EthAddress',
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      address: '',
      error: ''
    }
  },
  methods: {
    isUint256Valid(v) {
      this.error = /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256))) ? '' : 'Invalid 256-bit value'
    }
  },
  watch: {
    address(value){
      this.value = value;
      this.isUint256Valid(value);
    }
  },
}
</script>

<style>
span {
  color: red;
}
</style>
