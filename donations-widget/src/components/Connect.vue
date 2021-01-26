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
    const initPromiseResolve = () => {}
    return {
      web3: null,
      web3provider: null,
      chainId: 1, // TODO: needed?
      initPromiseResolve,
      initPromise: new Promise(initPromiseResolve),
      needReconnect: true,
      connectStyle: 'inline',
      disconnectStyle: 'none',
      web3Modal: this.myGetWeb3Modal(this.networkname),
      currentNetworkname: this.networkname ? this.networkname : 'rinkeby', // FIXME
    }
  },
  beforeUpdate() { // split
    const self = this;
    self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
    self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
//     window.ethereum.on('networkChanged', function(/*networkId*/) { 
//       // self.$emit('change', web3)
//     })
    // TODO: Duplicate code.
    async function doIt() {
      console.log('baseGetWeb3Provider', [self.providerurl, self.networkname])
      await self.initPromise;
      self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      self.initPromiseResolve(undefined) // Now `self.web3provider` is set.
      console.log('initPromiseResolve')
    }
    doIt()
  },
  watch: {
    chainId() {
      console.log("CCC", this.chainId)
      this.initPromiseResolve()
      this.connectAsync() // TODO: Don't connect early.
    },
    networkname() {
      console.log("this.networkname", this.networkname)
      async function doIt() {
        this.web3provider = await baseGetWeb3Provider(this.providerurl, this.currentNetworkname)
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
      console.log("A", this.web3Modal)
      this.web3Modal.on("connect", (/*info*/) => {
        console.log('connect')
        this.onConnect()
      })
      this.web3Modal.on("disconnect", (/*error*/) => {
        console.log('disconnect')
        this.onDisconnect()
      })
      this.web3Modal.on("chainChanged", (chainId) => {
        this.currentNetworkname = CHAINS[chainId]
      });
      this.onConnectReal()
    },
    async baseGetWeb3(/*providerurl, networkname*/) {
      // if (window.web3 && window.web3.chainId) return window.web3;

      console.log('baseGetWeb3 running')
      this.onSetWeb3provider()
      if (this.needReconnect) {
        this.web3 = this.web3provider ? new Web3(this.web3provider) : Web3.givenProvider ? new Web3() : null;
        this.needReconnect = false;
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
      console.log('changenetworkname', this.networkname)
      this.$emit('changenetworkname', this.networkname)
    },
    onDisconnectReal() {
      this.connectStyle = 'inline'
      this.disconnectStyle = 'none'
      console.log('changenetworkname', "NULL")
      this.$emit('changenetworkname', null)
    },
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    async connectAsync() {
      console.log('www', this.providerurl, this.networkname)
      const self = this;
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
      this.myGetWeb3Modal(this.networkname).clearCachedProvider()
      this.onDisconnect()
    },
  },
}
</script>
