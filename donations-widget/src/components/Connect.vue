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

async function baseGetWeb3Provider(providerurl, networkname) {
  return providerurl ? providerurl : await defaultWeb3Provider(networkname);
}

export default {
  name: 'Connect',
  props: [
    'providerurl',
    'networkname',
  ],
  data() {
    return {
      web3: null,
      web3provider: null,
      needReconnect: true,
      connectStyle: 'inline',
      disconnectStyle: 'none',
      web3Modal: null,
      currentNetworkname: this.networkname,
    }
  },
  created() {
    const self = this;
    async function doIt() { // FIXME: Not here
      self.web3Modal = self.myGetWeb3Modal(self.currentNetworkname)
      if (!self.networkname) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        self.currentNetworkname = CHAINS[Number(chainId)] // Number() because it returns in hex
        console.log('xxx', self.providerurl, self.currentNetworkname)
      }
      self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
    }
    doIt()
  },
  beforeUpdate() { // TODO: Which hook?
    const self = this;
    self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
    self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
//     window.ethereum.on('networkChanged', function(/*networkId*/) { 
//       // self.$emit('change', web3)
//     })
  },
  watch: {
    currentNetworkname(current, old) {
      const self = this
      console.log('c, o', current, old)
      console.log("this.networkname", this.currentNetworkname)
      async function doIt() {
        self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      }
      doIt()
      this.$emit('changenetworkname', this.networkname)
    },
    web3provider() {
      this.needReconnect = true
    },
  },
  methods: {
    // TODO: Inefficient.
    onSetWeb3provider() {
      if (self.web3provider) {
        console.log("A", this.web3Modal)
        self.web3provider.on("connect", (/*info*/) => {
          console.log('connect')
          //this.onConnect() // FIXME
        })
        self.web3provider.on("disconnect", (/*error*/) => {
          console.log('disconnect')
          this.onDisconnect()
        })
        console.log("ON")
        self.web3provider.on("chainChanged", (chainId) => {
          console.log("eee", chainId)
          this.currentNetworkname = CHAINS[chainId] // FIXME
        });
      }
      this.onConnectReal()
    },
    async baseGetWeb3(/*providerurl, networkname*/) {
      // if (window.web3 && window.web3.chainId) return window.web3;

      console.log('baseGetWeb3 running')
      this.onSetWeb3provider() // FIXME
      if (this.needReconnect) {
        this.web3 = this.web3provider ? new Web3(this.web3provider) : Web3.givenProvider ? new Web3() : null;
        this.needReconnect = false;
      }
      return this.web3
    },
    async getChainId(/*providerurl, networkname*/) { // TODO: Used?
      return 1 // FIXME
//      const web3 = await this.baseGetWeb3(/*providerurl, networkname*/);
//      if (!web3) {
//        return null;
//      }
//      return await web3.eth.getChainId();
    },
    onConnect() {
      if (window.ethereum.isConnected()) {
        this.onConnectReal()
      } else {
        this.onDisconnectReal()
      }
    },
    onDisconnect() {
      this.onDisconnectReal()
    },
    onConnectReal() {
      this.connectStyle = 'none'
      this.disconnectStyle = 'inline'
      console.log('changenetworkname', this.networkname)
      this.$emit('changenetworkname', this.networkname)
    },
    onDisconnectReal() {
      this.connectStyle = 'inline'
      this.disconnectStyle = 'none'
      console.log('onDisconnectReal', "NULL")
      this.$emit('changenetworkname', null)
    },
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    async connectAsync() {
      console.log('www', this.providerurl, this.networkname)
      this.web3 = await this.baseGetWeb3(/*self.providerurl, self.networkname*/)
      this.$emit('change', this.web3)
      return this.web3
    },
    connect() {
      console.log("connect command", window.ethereum.isConnected())
      this.connectAsync()
    },
    disconnect() {
      console.log("disconnect command")
      this.web3Modal.clearCachedProvider()
      this.onDisconnect()
    },
  },
}
</script>
