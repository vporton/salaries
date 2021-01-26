<template>
  <p :style="{display: this.showStyle, color: 'red'}">
    Currently Future Salaries supports only <strong>Rinkeby</strong> or <strong>BSC testnet</strong>, switch to it.
  </p>
</template>

<script>
export default {
  name: 'NetworkInfo',
  props: ['chainid', 'web3'],
  data() {
    return {
      showStyle: 'none',
    }
  },
  created() {
    this.updateWeb3()
  },
  watch: {
    web3() {
      this.updateWeb3()
    }
  },
  methods: {
    updateWeb3() {
      const self = this
      if (self.web3) {
        self.web3.eth.net.getId().then(netId => {
          switch (netId) {
            case 4:  // rinkeby
            case 97: // BSC testnet
              self.showStyle = 'none'
              break
            default:
              self.showStyle = 'block'
              break
          }
        })
      } else {
        self.showStyle = 'block'
      }
    }
  }
}
</script>
