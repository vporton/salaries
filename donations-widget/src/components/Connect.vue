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
  try {
    return await web3Modal.connect();
  }
  catch(e) {
    return null;
  }
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
      cachedNetworkname: this.networkname,
      initProviderPromiseResolve: null,
      initProviderPromise: null,
      initProviderPromiseFinished: false,
      initNetworknamePromiseResolve: null,
      initNetworknamePromise: null,
      initNetworknamePromiseFinished: false, // not needed?
    }
  },
  created() {
    const self = this;
    self.initProviderPromise = new Promise((resolve) => self.initProviderPromiseResolve = resolve)
    self.initNetworknamePromise = new Promise((resolve) => self.initNetworknamePromiseResolve = resolve)
    async function doIt() {
      self.web3Modal = self.myGetWeb3Modal(self.currentNetworkname)
      self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
      self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
      if (!self.networkname) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        self.currentNetworkname = CHAINS[Number(chainId)] // Number() because it returns in hex
      }
      self.initNetworknamePromiseResolve(undefined)
      self.initNetworknamePromiseFinished = true
      self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      self.updateWeb3provider()
      if (self.web3provider) {
        self.updateCurrentNetworknameButDontReconnect()
        self.initProviderPromiseResolve(undefined)
        self.initProviderPromiseFinished = true
      }
    }
    doIt()
  },
  watch: {
  },
  methods: {
    updateWeb3provider() {
      console.log("Watched web3provider")
      this.needReconnect = true

      if(!this.web3provider) return;
//      this.web3provider.on("connect", (/*info*/) => {
//        this.onWeb3ModalConnect()
//      })
      this.web3provider.on("disconnect", (/*error*/) => {
        console.log("Detected disconnect")
        this.onWeb3ModalDisconnect()
      })
      this.web3provider.on("chainChanged", (chainId) => {
        console.log("chainChanged!!")
        this.currentNetworkname = CHAINS[Number(chainId)] // Number() because it returns in hex
        this.updateCurrentNetworknameButDontReconnect()
      });
    },
    updateCurrentNetworknameButDontReconnect() {
      const self = this
      if (this.currentNetworkname) {
        this.cachedNetworkname = this.currentNetworkname
      }
      async function doIt() {
        await self.initNetworknamePromise;
        self.$emit('changenetworkname', self.currentNetworkname)
      }
      doIt()
    },
    updateCurrentNetworkname() {
      this.updateCurrentNetworknameButDontReconnect()
      const self = this
      async function doIt() {
        self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
        self.updateWeb3provider()
      }
      if(this.initProviderPromiseFinished) {
        doIt()
      }
    },
    async baseGetWeb3() {
      console.log("baseGetWeb3: this.needReconnect", this.needReconnect)
      if (this.needReconnect) {
        this.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
        if (this.web3provider) {
          this.web3 = new Web3(this.web3provider);
          if (this.cachedNetworkname) {
            this.currentNetworkname = this.cachedNetworkname
            //this.updateCurrentNetworknameButDontReconnect()
          }
          this.needReconnect = false;
          this.onConnectReal()
        }
      }
      return this.web3
    },
    async getChainId() { // TODO: Used?
      const web3 = await this.baseGetWeb3();
      if (!web3) {
        return null;
      }
      return await web3.eth.getChainId();
    },
    onWeb3ModalConnect() {
      if (window.ethereum.isConnected()) {
        this.onConnectReal()
      }
    },
    onWeb3ModalDisconnect() {
      this.onDisconnectReal()
    },
    onConnectReal() {
      this.connectStyle = 'none'
      this.disconnectStyle = 'inline'
      this.$emit('changenetworkname', this.currentNetworkname)
    },
    onDisconnectReal() {
      this.connectStyle = 'inline'
      this.disconnectStyle = 'none'
      this.$emit('changenetworkname', null)
    },
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    async connectAsync() {
      await this.initProviderPromise;
      this.web3 = await this.baseGetWeb3()
      this.$emit('changenetworkname', this.currentNetworkname)
      this.$emit('change', this.web3)
      return this.web3
    },
    connect() {
      //this.disconnect() // needed?
      console.log("connect()")
      this.needReconnect = true
      this.connectAsync()
    },
    disconnect() {
      this.web3Modal.clearCachedProvider()
      console.log("disconnect()")
      this.needReconnect = true
      this.onWeb3ModalDisconnect()
      this.currentNetworkname = undefined
      this.updateCurrentNetworknameButDontReconnect()
    },
  },
}
</script>
