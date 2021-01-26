<template>
  <span>
    <button @click="connect()" :style="{display: connectStyle}">Connect</button>
    <button @click="disconnect()" :style="{display: disconnectStyle}">Disconnect</button>
  </span>
</template>

<script>
import Web3 from 'web3';
import Web3Modal from "web3modal";
import Portis from "@portis/web3";
import Authereum from "authereum";
import ethProvider from "eth-provider";

// TODO
export const CHAINS = {
  '1': 'mainnet',
  '3': 'ropsten',
  '4': 'rinkeby',
  '5': 'goerli',
  '42': 'kovan',
  '1337': 'local',
  '122': 'fuse',
  '80001': 'mumbai',
  '137': 'matic',
  '99': 'core',
  '77': 'sokol',
  '100': 'xdai',
  '74': 'idchain',
  '56': 'bsc',
  '97': 'bsctest',
}

export let web3ModalProvider = null; // FIXME

function getWeb3Modal(networkname) {
  const providerOptions = {
    portis: {
      package: Portis, // required
      options: {
        id: "4f1af1e4-2205-4244-a2d3-59e3527a614b" // required
      }
    },
    authereum: {
      package: Authereum // required
    },
    frame: {
      package: ethProvider // required
    }
  };  
  return new Web3Modal({
    network: networkname, // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
}

async function defaultWeb3Provider(networkname) {
  const web3Modal = getWeb3Modal(networkname)
  return await web3Modal.connect();
}

async function baseGetWeb3Provider(providername, networkname) {
  return providername ? providername : await defaultWeb3Provider(networkname);
}

async function baseGetWeb3(providername, networkname) {
  // if (window.web3 && window.web3.chainId) return window.web3;

  const _web3Provider = await baseGetWeb3Provider(providername, networkname)
  return _web3Provider ? new Web3(_web3Provider) : Web3.givenProvider ? new Web3() : null;
}

export async function getChainId(providername, networkname) {
  const web3 = await baseGetWeb3(providername, networkname);
  if (!web3) {
    return null;
  }
  return await web3.eth.getChainId();
}

export default {
  name: 'Connect',
  props: [
    'providername',
    'networkname',
  ],
  data() {
    return {
      connectStyle: 'inline',
      disconnectStyle: 'none',
      web3Modal: this.myGetWeb3Modal(this.networkname),
    }
  },
  created() {
    const self = this;
    self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
    self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
    window.ethereum.on('networkChanged', function(/*networkId*/) {
      // self.$emit('change', web3)
    })
  },
  watch: {
    web3Modal() {
      if (!this.web3Modal) {
        return
      }
      const self = this;
      self.web3Modal.on("connect", (/*info*/) => {
        console.log('connect')
        self.connectStyle = 'none'
        self.disconnectStyle = 'inline'
      })
      self.web3Modal.on("disconnect", (/*error*/) => {
        console.log('disconnect')
        self.connectStyle = 'inline'
        self.disconnectStyle = 'none'
      })
      self.web3Modal.on("chainChanged", (chainId) => {
        this.networkname = CHAINS[chainId]
      });
    },
    networkname() {
      this.$emit('change-networkname', this.networkname)
    }
  },
  methods: {
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    connect() {
      const self = this
      console.log("connect command")
      async function doIt() {
        const web3 = await baseGetWeb3(self.providername, self.networkname)
        self.$emit('change', web3)
      }
      doIt()
    },
    disconnect() {
      console.log("disconnect command")
      this.myGetWeb3Modal(this.networkname).clearCachedProvider()
    },
  },
}
</script>
