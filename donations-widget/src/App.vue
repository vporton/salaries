<template>
  <div id="app">
    <header class="App-header">
      <router-view
        :networkname="this.currentNetworkname"
        @changenetworkname="updateNetworkname($event)"
        :oracleid="this.currentOracleId"
        @changeoracleid="currentOracleId = $event"
      />
    </header>
    <p>
      <a rel="noopener noreferrer" target="_blank" href="https://github.com/vporton/donations">
        <img src="GitHub-Mark-32px.png" width="32" height="32" alt="Source at GitHub"/>
      </a>
    </p>

    <!-- Go to www.addthis.com/dashboard to customize your tools -->
    <!--script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-6036f81ff96859a4"></script-->
  </div>
</template>

<script>
import { getAddresses } from './utils/AppLib'

export default {
  name: 'App',
  data() {
    return {
      prefix: './',
      currentNetworkname: undefined,
      currentOracleId: undefined,
    }
  },
  created() {
    const self = this
    self.myGetAddresses(self.prefix)
      .then(async function(abis) {
        if (abis) {
          self.web3 = window.web3
          const abis = await self.myGetAddresses(self.prefix);
          console.log('self.oracleid', self.oracleid)
          self.currentOracleId = self.oracleid !== undefined ? self.oracleid : (abis ? abis.oracleId : null);
          console.log('self.currentOracleId' , self.currentOracleId)
        }
      })
  },
  mounted() {
    let addThisScript = document.createElement('script')
    addThisScript.setAttribute('src', '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-6036f81ff96859a4')
    document.body.appendChild(addThisScript)
  },
  watch: {
    currentNetworkname() {
      const self = this
      async function doIt() {
        const abis = await self.myGetAddresses(self.prefix)
        console.log('ddd', abis.oracleId)
        self.currentOracleId = abis.oracleId
      }
      doIt()
    },
  },
  methods: {
    async myGetAddresses(PREFIX) {
      return await getAddresses(PREFIX, this.currentNetworkname)
    },
    updateNetworkname(name) {
      console.log('pppppp', name)
      this.currentNetworkname = name
    }
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.ethereumAddress {
  font-size: 72%;
}
</style>
