<template>
  <p :style="{display: this.showStyle, color: 'red'}">
    Currently Future Salaries supports only <strong>Rinkeby</strong> testnet, switch to it.
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
      if (this.web3) {
        this.web3.eth.net.getId().then(netId => {
          switch (netId) {
            case 4: // rinkeby
              this.showStyle = 'none'
              break
            default:
              this.showStyle = 'block'
              break
          }
        })
      } else {
        this.showStyle = 'block'
      }
    }
  }
}
</script>
