<template>
  <div>
    <p style="color: red">
      This is demo version for a testnet. Contracts are not enough tested and audited yet.
      <a target="_blank" href="https://gitcoin.co/grants/1591/science-of-the-future-the-100-years-forward-plan">Donate</a>
      for contract audit!
    </p>
    <NetworkInfo :chainid="chainid" :networkname="networkname" :web3="web3"/>
    <p>
        <small>
            Free software authors, scientists/inventors, science/software publishers, carbon accounters,
            and other common good producers:
        </small>
    </p>
    <p>
        Condition ID:
        <Uint256
          :value="conditionId"
          @input="conditionId = $event !== '' ? $event : undefined; updateRegisteredStatus();"
          size="20"/>
        <span>
          {{' '}}
          <span :style="{display: isDefaultID}">(Your default condition ID)</span>
          <span :style="{display: isNotDefaultID}">
            <button @click="setDefaultID">Go to default ID</button>
          </span>
        </span>
        <span :style="{display: noSuchConditionStyle, color: 'red'}"><br/>No such condition ID</span>
    </p>
    <p>
        <button class="donateButton" :style="{display: registerStyle}" @click="register">Register for a salary</button>
        <span :style="{display: alreadyRegisterStyle, textAlign: 'left'}">
          <label>Salary recipient:</label> <code class="ethereumAddress">{{salaryRecipient}}</code> <br/>
          <label>On account:</label> {{amountOnAccountFormatted}} personal tokens. <br/>
          <label>Registration date:</label> {{new Date(registrationDate*1000)}}. <br/>
          <label>Last withdrawal date:</label> {{lastSalaryDate !== registrationDate ? new Date(lastSalaryDate*1000) : "not yet"}}. <br/>
          <label>Salary to be paid:</label> <span>{{toBePaid}}</span> personal tokens.
            <button @click="withdraw">Withdraw</button> <br/>
          <small>Withdrawal is a paid service, so please withdraw only when you are going to use the money.</small> <br/>
          <label>Lifetime salary:</label> <span>{{lifetimeSalary}}</span> personal tokens.
        </span>
        <br/>
        <small>
            After you have been registered, see TODO to improve your rating.
            <br/>
            Remember, if you publish open source, your rating will tend to improve.
        </small>
    </p>
    <p>
        <small>
            Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.
        </small>
        <br/>
        <small>
            No matter what happens, you will receive 1 token per second since the moment of registration till you die
            (or go inopt for corporations).
            <br/>
            Your salary exchange rate will be "calculated" by free market based on future predictions of your performance,
            such as your expected citations count in the future.
        </small>
    </p>
  </div>
</template>

<script>
import Web3 from 'web3'
import { isUint256Valid, mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'
import Uint256 from '@/components/Uint256.vue'
import NetworkInfo from '@/components/NetworkInfo.vue'
const BN = Web3.utils.BN

export default {
  name: 'Register',
  props: [
    'prefix',
    'chainid',
    'networkname',
    'providerurl',
    'initialconditionid',
    'web3Getter',
  ],
  components: {
    Uint256,
    NetworkInfo,
  },
  data() {
    const conditionId = this.initialconditionid === undefined || this.initialconditionid === ''
      ? undefined : this.initialconditionid
    return {
      web3: null,
      oracleId: null,
      registerCallbacks: [],
      conditionId,
      tokenId: null, // TODO: Is this field needed?
      registerStyle: 'none',
      alreadyRegisterStyle: 'none',
      toBePaid: null,
      lifetimeSalary: null,
      registrationDate: undefined,
      lastSalaryDate: null,
      noSuchConditionStyle: 'none',
      isDefaultID: 'none',
      isNotDefaultID: 'none',
      timeoutHandle: null,
      salaryRecipient: undefined,
      amountOnAccount: undefined,
      amountOnAccountFormatted: '',
      salaryRecipientEvents: [],
      tokenIdEvents: [],
    }
  },
  watch: {
    conditionId() {
      // this.updateRegisteredStatus()

      const self = this
      async function doIt() {
        const web3 = await await self.getWeb3();
        if (web3) {
          const addresses = await self.myGetAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);

          self.onUpdateConditionId()

          for (let ev of self.salaryRecipientEvents) {
            ev.unsubscribe();
          }

          if (self.conditionId !== undefined && self.salaryRecipient !== undefined) {
            self.salaryRecipientEvents.push(science.events.ConditionReCreate({
              filter: {customer: self.salaryRecipient, condition: self.conditionId}},
              async (error, event) => {
                if (!error) {
                  self.tokenId = event.returnValues.newCondition;
                }
              }))

            // after subscribing
            self.tokenId = await science.methods.firstToLastConditionInChain(self.conditionId).call()
          }
        }
      }
      doIt();
    },
    salaryRecipient() {
      this.updateAmountOnAccount()
    },
    tokenId() {
      const self = this
      async function doIt() {
        const web3 = await await self.getWeb3();
        if (!web3) {
          return;
        }
        const addresses = await self.myGetAddresses(self.prefix);
        if (!addresses) return;
        const wrapperAbi = (await getABIs(self.prefix)).UnitedSalaryTokenWrapper;
        const wrapper = new web3.eth.Contract(wrapperAbi, addresses.UnitedSalaryTokenWrapper.address);

        for (let ev of self.tokenIdEvents) {
          ev.unsubscribe();
        }
        self.tokenIdEvents.push(wrapper.events.TransferSingle(
          {filter: {to: self.salaryRecipient, id: self.tokenId}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              self.amountOnAccount = self.amountOnAccount.add(new BN(event.returnValues.value));
            }
          }));
        self.tokenIdEvents.push(wrapper.events.TransferSingle(
          {filter: {from: self.salaryRecipient, id: self.tokenId}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              self.amountOnAccount = self.amountOnAccount.sub(new BN(event.returnValues.value));
            }
          }));
        self.tokenIdEvents.push(wrapper.events.TransferBatch(
          {filter: {to: self.salaryRecipient}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              const ids = event.returnValues.ids;
              for (let i = 0; i != ids.length; ++i) {
                if (ids[i] === self.tokenId) {
                  self.amountOnAccount = self.amountOnAccount.add(new BN(event.returnValues.values[i]));
                }
              }
            }
          }));
        self.tokenIdEvents.push(wrapper.events.TransferBatch(
          {filter: {from: self.salaryRecipient}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              const ids = event.returnValues.ids;
              for (let i = 0; i != ids.length; ++i) {
                if (ids[i] === self.tokenId) {
                  self.amountOnAccount = self.amountOnAccount.sub(new BN(event.returnValues.values[i]));
                }
              }
            }
          }));
      }
      doIt(); 
    },
    amountOnAccount() {
      this.amountOnAccountFormatted = this.amountOnAccount !== undefined
        ? Web3.utils.fromWei(this.amountOnAccount)
        : '';
    },
    web3() { // FIXME: Works on network change in MetaMask?
      // TODO: Is the following correct?
      this.updateRegisteredStatus()
      this.updateAmountOnAccount()
      this.updateRegistrationStyles()
    },
  },
  created() {
    const self = this
    self.myGetAddresses(self.prefix)
      .then(function(abis) {
        self.oracleId = abis ? abis.oracleId : null
      })
    self.onUpdateConditionId()
    self.updateRegisteredStatus()
    window.registerComponent = self // bug workaround used in GitCoin
  },
  methods: {
    async myGetAddresses(PREFIX) {
      return await getAddresses(PREFIX, this.networkname)
    },
    withdraw() {
      const self = this
      async function doIt() {
        const web3 = await await self.getWeb3();
        const account = (await getAccounts(self.providerurl, self.networkname))[0];
        if (account !== self.salaryRecipient) {
          alert("Use the salary recepient's account.")
          return
        }
        if (web3 && account !== undefined) {
          const addresses = await self.myGetAddresses(self.prefix)
          if (!addresses) return
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address)
          const tx = await mySend(
            await this.getWeb3(), science,
            science.methods.mintSalary,
            [self.oracleId, self.conditionId, []],
            {from: account},
            null)
          await tx
          self.updateAmountOnAccount()
        } 
      }
      doIt();
    },
    updateAmountOnAccount() {
      const self = this
      async function doIt() {
        const web3 = await await self.getWeb3();
        // FIXME: Races!
        // It may be more efficient to use directly the Salary contract, but be aware of race conditions:
        const addresses = await self.myGetAddresses(self.prefix);
        if (self.conditionId !== undefined && addresses) {
          if (web3) {
            const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
            const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
            const wrapperAbi = (await getABIs(self.prefix)).UnitedSalaryTokenWrapper;
            const wrapper = new web3.eth.Contract(wrapperAbi, addresses.UnitedSalaryTokenWrapper.address);

            if (self.salaryRecipient === undefined || /^0x0+/.test(self.salaryRecipient)) {
              self.lastSalaryDate = undefined
              self.amountOnAccount = undefined
            } else {
              const balance = await wrapper.methods.balanceOf(self.salaryRecipient, self.conditionId).call()
              self.lastSalaryDate = await science.methods.lastSalaryDates(self.conditionId).call()
              self.amountOnAccount = balance // Update it after the previous statement to be immediate.
            }
          } else {
            self.lastSalaryDate = undefined
            self.amountOnAccount = undefined
          }
        } else {
          // Hack.
          self.lastSalaryDate = undefined
          self.amountOnAccount = undefined
          self.registrationDate = undefined
          self.updateRegistrationStyles()
        }
      }
      doIt()
    },
    onUpdateConditionId() {
      // TODO: The following causes a serious bug:
//      if (this.timeoutHandle !== null) {
//        clearTimeout(this.timeoutHandle);
//        this.timeoutHandle = null
//      }
      const self = this
      async function doIt() {
        const web3 = await await self.getWeb3();
        if (web3) {
          const addresses = await self.myGetAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);

          self.salaryRecipient = self.conditionId !== undefined
            ? await science.methods.conditionOwners(self.conditionId).call()
            : undefined;
        }
      }
      doIt()
      this.isDefaultID = this.conditionId !== undefined && this.conditionId === this.initialconditionid ? 'inline' : 'none'
      this.isNotDefaultID = this.conditionId !== this.initialconditionid ? 'inline' : 'none'
    },
    setDefaultID() {
      this.conditionId = this.initialconditionid
      this.updateRegisteredStatus()
    },
    updateRegistrationStyles() {
      if (this.registrationDate === undefined) {
        // TODO: For a non-supported Ethereum network use 'none'.
        this.noSuchConditionStyle = this.conditionId !== undefined ? 'inline' : 'none'
        this.registerStyle = 'inline'
        this.alreadyRegisterStyle = 'none'
      } else {
        this.noSuchConditionStyle = 'none'
        this.registerStyle = this.conditionId !== undefined ? 'none' : 'inline'
        this.alreadyRegisterStyle = this.conditionId !== undefined ? 'inline-block' : 'none'
      }
    },
    updateRegisteredStatus() { // TODO: Rename.
      const self = this
      async function loadData() {
        const web3 = await await self.getWeb3();
        const account = (await getAccounts(self.providerurl, self.networkname))[0];
        if (web3 && account !== undefined) {
          const addresses = await self.myGetAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
          const maxConditionId = await science.methods.maxConditionId().call()
          // TODO: Should watch events for change of `self.salaryRecipient`
          if (Number(self.conditionId) > 0 && Number(self.conditionId) <= Number(maxConditionId)) {
            [self.salaryRecipient, self.registrationDate, self.lastSalaryDate] =
              await Promise.all([
                science.methods.conditionOwners(self.conditionId).call(),
                science.methods.conditionCreationDates(self.conditionId).call(),
                science.methods.lastSalaryDates(self.conditionId).call()])
          } else {
            [self.salaryRecipient, self.registrationDate, self.lastSalaryDate] = [undefined, undefined, undefined]
          }
          self.updateAmountOnAccount()
          self.updateRegistrationStyles()
        } 
      }
      if (self.conditionId !== undefined && isUint256Valid(self.conditionId)) {
        loadData()
        self.startShowingSalary()
      } else {
        self.updateRegistrationStyles()
      }
    },
    addRegisterCallback(f) { // bug workaround used in GitCoin
      this.registerCallbacks.push(f)
    },
    async register() {
      const self = this
      const web3 = await await this.getWeb3();
      const account = (await getAccounts(self.providerurl, self.networkname))[0];
      if (web3 && account !== undefined) {
        const addresses = await self.myGetAddresses(this.prefix);
        if (!addresses) return;
        const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
        await mySend(await self.getWeb3(), science, science.methods.registerCustomer, [account, this.oracleId, true, []], {from: account}, null)
          .then(txData => {
            self.conditionId = txData.events.ConditionCreated.returnValues.condition;
            self.updateRegisteredStatus(); // Call it even if self.conditionId didn't change.
            console.log('conditionId:', self.conditionId);
            self.$emit('conditionCreated', self.conditionId);
            for(let f of self.registerCallbacks) {
              f(self.conditionId);
            }
          })
          .catch(e => {
            alert(/You are already registered\./.test(e.message) ? "You are already registered." : e.message);
          })
      }
    },
    updateSalary() {
      const time = Date.now();
      const seconds = Math.floor(time / 1000);
      this.toBePaid = seconds - this.lastSalaryDate;
      this.lifetimeSalary = seconds - this.registrationDate;
      this.timeoutHandle = setTimeout(this.updateSalary.bind(this), time - seconds * 1000);
    },
    startShowingSalary() {
      this.updateSalary()
    },
    async getWeb3() {
      console.log('ttt', this.web3Getter)
      return this.web3Getter ? await this.web3Getter() : window.web3
    },
  },
}
</script>

<style src="../assets/Donate.css"></style>
