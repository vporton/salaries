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
  const provider = await web3Modal.connect();
  return provider
}

async function baseGetWeb3Provider(providerurl, networkname) {
  const provider = providerurl ? providerurl : await defaultWeb3Provider(networkname);
  return provider
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
      initProviderPromiseResolve: null,
      initProviderPromise: null,
      initProviderPromiseFinished: false,
    }
  },
  created() {
    const self = this;
    self.initProviderPromise = new Promise((resolve) => self.initProviderPromiseResolve = resolve)
    async function doIt() { // FIXME: Not here
      self.web3Modal = self.myGetWeb3Modal(self.currentNetworkname)
      self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
      self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
      if (!self.networkname) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        self.currentNetworkname = CHAINS[Number(chainId)] // Number() because it returns in hex
      }
      const provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      self.web3provider = provider
      self.initProviderPromiseResolve(undefined)
      self.initProviderPromiseFinished = true
    }
    doIt()
  },
  watch: {
    currentNetworkname(/*current, old*/ ) {
      if(!this.initProviderPromiseFinished) {
        return
      }
      const self = this
      async function doIt() {
        self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      }
      doIt()
      this.$emit('changenetworkname', this.networkname)
    },
    web3provider() {
      this.needReconnect = true

      if(!this.web3provider) return;
      this.web3provider.on("connect", (/*info*/) => {
        this.onConnect() // FIXME
      })
      this.web3provider.on("disconnect", (/*error*/) => {
        this.onDisconnect()
      })
      this.web3provider.on("chainChanged", (chainId) => {
        console.log("chainChanged!!")
        this.currentNetworkname = CHAINS[chainId] // FIXME
      });
//      }
      //this.onConnectReal()
    },
  },
  methods: {
    async baseGetWeb3(/*providerurl, networkname*/) {
      // if (window.web3 && window.web3.chainId) return window.web3;

      if (this.needReconnect) {
        this.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
        this.web3 = this.web3provider ? new Web3(this.web3provider) : Web3.givenProvider ? new Web3() : null;
        this.needReconnect = false;
        this.onConnectReal()
      }
      return this.web3
    },
    async getChainId(/*providerurl, networkname*/) { // TODO: Used?
      const web3 = await this.baseGetWeb3(/*providerurl, networkname*/);
      if (!web3) {
        return null;
      }
      return await web3.eth.getChainId();
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
      this.$emit('changenetworkname', this.networkname)
    },
    onDisconnectReal() {
      this.connectStyle = 'inline'
      this.disconnectStyle = 'none'
      this.$emit('changenetworkname3', null)
    },
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    async connectAsync() {
      await this.initProviderPromise;
      this.web3 = await this.baseGetWeb3(/*self.providerurl, self.networkname*/)
      this.$emit('change', this.web3)
      return this.web3
    },
    connect() {
      this.disconnect() // needed?
      this.connectAsync()
    },
    disconnect() {
      this.web3Modal.clearCachedProvider()
      this.needReconnect = true
      this.onDisconnect()
    },
  },
}
</script>
