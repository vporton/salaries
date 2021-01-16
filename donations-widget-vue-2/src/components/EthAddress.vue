<template>
  <div>
    <span class="EthAddress">
      <input
        type="text"
        maxLength="42"
        size="50"
        value="value"
        :class="{ error: isAddressValid(props.value) }"
        @change="onChange"
      />
    </span>
  </div>
</template>

<script>

export default {
  name: 'EthAddress',
  props: ['onchange'],
  data() {
    return {
      value: ''
    }
  },
  methods: {
    onChange(value) {
      this.value = value
    },
    isAddressValid(v) {
      return window.web3.utils.isEthAddress(v)
    }
  }
}
