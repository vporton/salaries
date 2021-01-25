<template>
  <button @click="disconnect()" :style="{display: displayStyle}">Disconnect</button>
</template>

<script>
import { web3Modal, getWeb3Provider } from '../utils/AppLib'

export default {
  name: 'Disconnect',
  props: [
    'providername',
    'networkname',
  ],
  data() {
    return {
      displayStyle: 'none',
    }
  },
  created() {
    const self = this;
    async function doIt() {
      if (provider) {
        self.displayStyle = 'inline'
        web3ModalProvider.on("connect", (/*info*/) => {
          console.log('connect')
          self.displayStyle = 'inline'
        })
        web3ModalProvider.on("disconnect", (/*error*/) => {
          console.log('disconnect')
          self.displayStyle = 'none'
        })
      }
    }
    doIt()
  },
  methods: {
    disconnect() {
      console.log("disconnect command")
      web3Modal.clearCachedProvider()
    }
  },
}
</script>
