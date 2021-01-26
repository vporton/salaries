<template>
  <span class="EthAddress">
    <input
      type="text"
      maxLength="42"
      size="50"
      :value="value2"
      @input="input"
      @change="change"
      :class="className" />
    <br />
    <code class="ethereumAddress">{{ digital }}</code>
  </span>
</template>

<script>
import Web3 from 'web3'
import validators from '../utils/validators'

const NO_SUCH_ADDRESS = "(no such address)"

export default {
  name: 'EthAddress',
  props: ['value'],
  data() {
    return {
      address: null,
      value2: this.value,
      className: this.isEthAddressValid(this.value) ? '' : 'error',
      digital: '',
    }
  },
  created() {
    this.transform(this.value)
      .then(this.baseInput)
  },
  methods: {
    async transform(v) {
      const valid = validators.isEthAddressValid(v)
      if (!valid && v !== "") {
        const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/1d0c278301fc40f3a8f40f25ae3bd328"));
        try {
          return await web3.eth.ens.getAddress(v)
        }
        catch(_) { /* */ }
        return null
      } else {
        return v
      }
    },
    baseInput(value) {
      const self = this
      this.value2 = value
      async function doIt() {
        const address = await self.transform(value)
        self.address = address !== null ? address : value
        if (address !== null) {
          self.digital = address
          self.className = ''
        } else {
          self.digital = value !== "" ? NO_SUCH_ADDRESS : ""
          self.className = 'error'
        }
      }
      if (/^0x[0-9a-f]/i.test(value)) {
        const valid = validators.isEthAddressValid(value)
        if (valid) {
          self.address = value
          self.digital = "valid address"
          self.className = ''
        } else {
          self.address = value
          self.digital = NO_SUCH_ADDRESS
          self.className = 'error'
        }
      } else if (value === '') {
        self.address = ''
        self.digital = NO_SUCH_ADDRESS
        self.className = 'error'
      } else {
        self.digital = "(querying...)" // temporary, before the network is queried
        self.className = 'error'

        doIt()
      }
    },
    input(event) {
      this.baseInput(event.target.value)
    },
    change(event) {
      this.baseInput(event.target.value)
      this.$emit('change', this.address)
    },
    isEthAddressValid(value) {
      return validators.isEthAddressValid(value)
    },
  },
  watch: {
    value(v) {
      if(v !== this.address || v === '') {
        this.value2 = v
      }
    },
    address(v) {
      this.$emit('input', v)
    },
  },
}
</script>
