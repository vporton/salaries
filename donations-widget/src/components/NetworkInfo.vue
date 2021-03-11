<template>
  <p :style="{color: 'red'}">
    This app supports
    <strong>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.xdaichain.com/for-users/wallets/metamask/metamask-setup"
      >xDai</a>
    </strong>
    and
    <strong>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://docs.binance.org/smart-chain/wallet/metamask.html"
      >BSC</a>
    </strong>
    networks.
    You currently need to use xDai for the common goods crowdfunding.
    <span :style="{display: this.showStyle}">
      <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/download">Install MetaMask to connect!</a>
    </span>
  </p>
</template>

<script>
export default {
  name: 'NetworkInfo',
  props: ['networkname', 'web3'],
  data() {
    return {
      showStyle: 'inline',
    }
  },
  created() {
    this.updateWeb3()
  },
  watch: {
    networkname() { // FIXME: a wrong property to watch
      this.updateWeb3()
    },
    web3() { // FIXME: a wrong property to watch
      this.updateWeb3()
    },
  },
  methods: {
    updateWeb3() {
      const self = this
      if (self.web3) {
        self.web3.eth.net.getId().then(netId => {
          console.log('ppp', netId)
          switch (netId) {
            case 100: // xDai
            case 4: // rinkeby
            case 56: // BSC
            case 97: // BSC Testnet
            case 80001: // Mumbai
              self.showStyle = 'none'
              break
            default:
              self.showStyle = 'inline'
              break
          }
        })
      } else {
        self.showStyle = 'inline'
      }
    }
  }
}
</script>
