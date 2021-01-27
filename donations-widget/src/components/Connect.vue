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
      cachedNetworkname: this.networkname,
      initProviderPromiseResolve: null,
      initProviderPromise: null,
      initProviderPromiseFinished: false,
    }
  },
  created() {
    const self = this;
    self.initProviderPromise = new Promise((resolve) => self.initProviderPromiseResolve = resolve)
    async function doIt() {
      self.web3Modal = self.myGetWeb3Modal(self.currentNetworkname)
      self.connectStyle = self.web3Modal.cachedProvider ? 'none' : 'inline'
      self.disconnectStyle = self.web3Modal.cachedProvider ? 'inline' : 'none'
      if (!self.networkname) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        self.currentNetworkname = CHAINS[Number(chainId)] // Number() because it returns in hex
        self.updateCurrentNetworknameButDontReconnect()
      }
      console.log("RESO1", self.currentNetworkname  )
      self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      console.log("RESO")
      self.initProviderPromiseResolve(undefined)
      self.initProviderPromiseFinished = true
    }
    doIt()
  },
  watch: {
    web3provider() {
      this.needReconnect = true

      if(!this.web3provider) return;
      // FIXME: Uncomment.
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
  },
  methods: {
    updateCurrentNetworknameButDontReconnect() {
      if (this.currentNetworkname) {
        this.cachedNetworkname = this.currentNetworkname
      }
      console.log("PP", this.currentNetworkname)
      this.$emit('changenetworkname', this.currentNetworkname) // FIXME: causes no RESO
    },
    updateCurrentNetworkname() {
      this.updateCurrentNetworknameButDontReconnect()
      const self = this
      async function doIt() {
        self.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
      }
      if(this.initProviderPromiseFinished) {
        doIt()
      }
    },
    async baseGetWeb3() {
      console.log("B", this.needReconnect)
      if (this.needReconnect) {
        this.web3provider = await baseGetWeb3Provider(self.providerurl, self.currentNetworkname)
        this.web3 = this.web3provider ? new Web3(this.web3provider) : Web3.givenProvider ? new Web3() : null;
        if (this.cachedNetworkname) {
          this.currentNetworkname = this.cachedNetworkname
          //this.updateCurrentNetworknameButDontReconnect()
        }
        console.log('this.currentNetworkname', this.currentNetworkname)
        this.needReconnect = false;
        this.onConnectReal()
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
      console.log("PP", this.currentNetworkname)
      this.$emit('changenetworkname', this.currentNetworkname)
    },
    onDisconnectReal() {
      this.connectStyle = 'inline'
      this.disconnectStyle = 'none'
      console.log("DD", null)
      this.$emit('changenetworkname', null)
    },
    myGetWeb3Modal(networkname) {
      return getWeb3Modal(networkname);
    },
    async connectAsync() {
      console.log("A")
      await this.initProviderPromise;
      console.log("X")
      this.web3 = await this.baseGetWeb3()
      console.log("Y")
      console.log("UUU", this.currentNetworkname)
      this.$emit('changenetworkname', this.currentNetworkname)
      this.$emit('change', this.web3)
      return this.web3
    },
    connect() {
      //this.disconnect() // needed?
      this.needReconnect = true
      this.connectAsync()
    },
    disconnect() {
      this.web3Modal.clearCachedProvider()
      this.needReconnect = true
      this.onWeb3ModalDisconnect()
      this.currentNetworkname = undefined
      this.updateCurrentNetworkname()
    },
  },
}
</script>
