<template>
  <div>
    <p style="color: red">This is demo version for a testnet. Contracts are not enough tested and audited yet.</p>
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
        <span :style="{display: alreadyRegisterStyle}">
          Salary recipient: <code class="ethereumAddress">{{salaryRecipient}}</code> <br/>
          On account: {{amountOnAccountFormatted}} personal tokens. <br/>
            Registration date: {{new Date(registrationDate*1000)}}. <br/>
          Last withdrawal date: {{lastSalaryDate !== registrationDate ? new Date(lastSalaryDate*1000) : "not yet"}}. <br/>
          Salary to be paid: <span>{{toBePaid}}</span> personal tokens.
          <button @click="withdraw">Withdraw</button> <br/>
          <small>Withdrawal is a paid service, so please withdraw only when you are going to use the money.</small> <br/>
          Lifetime salary: <span>{{lifetimeSalary}}</span> personal tokens.
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
import { isUint256Valid, getWeb3, mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'
import Uint256 from '@/components/Uint256.vue'

export default {
  name: 'Register',
  props: [
    'prefix',
    'initialconditionid',
  ],
  components: {
    Uint256,
  },
  data() {
    const conditionId = this.initialconditionid === undefined || this.initialconditionid === ''
      ? undefined : this.initialconditionid
    return {
      oracleId: null,
      registerCallbacks: [],
      conditionId,
      tokenId: null,
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
      this.onUpdateConditionId()
    },
    salaryRecipient() {
      const self = this
      async function doIt() {
        const web3 = await getWeb3();
        if (web3) {
          const addresses = await getAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);

          for (let ev of self.salaryRecipientEvents) {
            ev.unsubscribe();
          }
          self.salaryRecipientEvents.push(science.events.ConditionReCreate({
            filter: {customer: self.salaryRecipient, oldCondition: self.tokenId}},
            async (error, event) => {
              if (!error) {
                self.tokenId = event.returnValues.newCondition;
              }
            }));

          // after subscribing
          self.updateAmountOnAccount()
        }
      }
      doIt();
    },
    tokenId() {
      const self = this
      async function doIt() {
        const web3 = await getWeb3();
        if (!web3) {
          return;
        }
        const addresses = await getAddresses(self.prefix);
        if (!addresses) return;
        const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);

        for (let ev of self.tokenIdEvents) {
          ev.unsubscribe();
        }
        self.tokenIdEvents.push(science.events.TransferSingle(
          {filter: {to: self.salaryRecipient, id: self.tokenId}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              self.amountOnAccount = self.amountOnAccount.add(event.returnValues.value);
            }
          }));
        self.tokenIdEvents.push(science.events.TransferSingle(
          {filter: {from: self.salaryRecipient, id: self.tokenId}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              self.amountOnAccount = self.amountOnAccount.sub(event.returnValues.value);
            }
          }));
        self.tokenIdEvents.push(science.events.TransferBatch(
          {filter: {to: self.salaryRecipient}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              const ids = event.returnValues.ids;
              for (let i = 0; i != ids.length; ++i) {
                if (ids[i] === self.tokenId) {
                  self.amountOnAccount = self.amountOnAccount.add(event.returnValues.values[i]);
                }
              }
            }
          }));
        self.tokenIdEvents.push(science.events.TransferBatch(
          {filter: {from: self.salaryRecipient}},
          async (error, event) => {
            if (!event.returnValues.from === event.returnValues.to) {
              const ids = event.returnValues.ids;
              for (let i = 0; i != ids.length; ++i) {
                if (ids[i] === self.tokenId) {
                  self.amountOnAccount = self.amountOnAccount.sub(event.returnValues.values[i]);
                }
              }
            }
          }));
      }
      doIt(); 
    },
    amountOnAccount() {
      this.amountOnAccountFormatted = Web3.utils.fromWei(this.amountOnAccount);
    },
  },
  created() {
    const self = this
    getAddresses(this.prefix)
      .then(function(abis) {
        self.oracleId = abis.oracleId
      })
    this.updateRegisteredStatus()
    this.onUpdateConditionId()
    window.registerComponent = self // bug workaround used in GitCoin
  },
  methods: {
    withdraw() {
      const self = this
      async function doIt() {
        const web3 = await getWeb3();
        const account = (await getAccounts())[0];
        if (account !== self.salaryRecipient) {
          alert("Use the salary recepient's account.")
          return
        }
        if (web3 && account !== null) {
          const addresses = await getAddresses(self.prefix)
          if (!addresses) return
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address)
          const tx = await mySend(
            science,
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
        const web3 = await getWeb3();
        if (web3) {
          const addresses = await getAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);

          const balance = await science.methods.balanceOf(self.salaryRecipient, self.conditionId).call()
          self.lastSalaryDate = await science.methods.lastSalaryDates(self.conditionId).call()
          // FIXME: It's unreliable, because the token may be recreated meantime. Use a special view contract instead.
          self.amountOnAccount = balance // Update it after the previous statement to be immediate.
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
      this.isDefaultID = this.conditionId !== undefined && this.initialconditionid ? 'inline' : 'none'
      this.isNotDefaultID = this.conditionId !== this.initialconditionid ? 'inline' : 'none'
    },
    setDefaultID() {
      this.conditionId = this.initialconditionid
      this.updateRegisteredStatus()
    },
    updateRegistrationStyles() {
      if (this.registrationDate === undefined) {
        this.noSuchConditionStyle = this.conditionId !== undefined ? 'inline' : 'none'
        this.registerStyle = 'inline'
        this.alreadyRegisterStyle = 'none'
      } else {
        this.noSuchConditionStyle = 'none'
        this.registerStyle = this.conditionId !== undefined ? 'none' : 'inline'
        this.alreadyRegisterStyle = this.conditionId !== undefined ? 'inline' : 'none'
      }
    },
    updateRegisteredStatus() { // TODO: Rename.
      this.tokenId = this.conditionId
      const self = this
      async function loadData() {
        const web3 = await getWeb3();
        const account = (await getAccounts())[0];
        if (web3 && account !== null) {
          const addresses = await getAddresses(self.prefix);
          if (!addresses) return;
          const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
          const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
          const maxConditionId = await science.methods.maxConditionId().call()
          if (Number(self.conditionId) > 0 && Number(self.conditionId) <= Number(maxConditionId)) { // FIXME: BigNumber
            [self.salaryRecipient, self.registrationDate, self.lastSalaryDate] =
              await Promise.all([
                science.methods.conditionOwners(self.conditionId).call(),
                science.methods.conditionCreationDates(self.conditionId).call(),
                science.methods.lastSalaryDates(self.conditionId).call()])
          } else {
            [self.salaryRecipient, self.registrationDate, self.lastSalaryDate] = [undefined, undefined, undefined]
          }
          self.updateRegistrationStyles()
        } 
      }
      if (this.conditionId !== undefined && isUint256Valid(this.conditionId)) {
        loadData()
        this.startShowingSalary()
      } else {
        this.updateRegistrationStyles()
      }
    },
    addRegisterCallback(f) { // bug workaround used in GitCoin
      this.registerCallbacks.push(f)
    },
    async register() {
      const web3 = await getWeb3();
      const account = (await getAccounts())[0];
      if (web3 && account !== null) {
        const addresses = await getAddresses(this.prefix);
        if (!addresses) return;
        const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
        await mySend(science, science.methods.registerCustomer, [account, this.oracleId, true, []], {from: account}, null)
          .then(txData => {
            this.conditionId = txData.events.ConditionCreated.returnValues.condition;
            this.updateRegisteredStatus(); // Call it even if this.conditionId didn't change.
            console.log('conditionId:', this.conditionId);
            this.$emit('conditionCreated', this.conditionId);
            for(let f of this.registerCallbacks) {
              f(this.conditionId);
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
  },
}
</script>

<style src="../assets/Donate.css"></style>
