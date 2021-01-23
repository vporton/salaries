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
        <span :style="{display: noSuchConditionStyle, color: 'red'}"><br/>No such condition ID</span>
    </p>
    <p>
        <button class="donateButton" :style="{display: registerStyle}" @click="register">Register for a salary</button>
        <span :style="{display: alreadyRegisterStyle}">
          Registration date: {{new Date(registrationDate*1000)}} <br/>
          Last withdrawal date: {{lastSalaryDate !== registrationDate ? new Date(lastSalaryDate*1000) : "not yet"}} <br/>
          Salary to be paid: <span>{{toBePaid}}</span> personal tokens. <br/>
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
import { isUint256Valid, getWeb3, mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'
import Uint256 from '@/components/Uint256.vue'

export default {
  name: 'Register',
  props: [
    'prefix',
    'initialConditionId',
  ],
  components: {
    Uint256,
  },
  data() {
    const conditionId = this.initialConditionId === undefined || this.initialConditionId === ''
      ? undefined : this.initialConditionId
    return {
      oracleId: null,
      registerCallbacks: [],
      conditionId,
      registerStyle: 'none',
      alreadyRegisterStyle: 'none',
      toBePaid: null,
      lifetimeSalary: null,
      registrationDate: undefined,
      lastSalaryDate: null,
      noSuchConditionStyle: 'none',
    }
  },
//  watch: {
//    conditionId() {
//      this.updateRegisteredStatus()
//    },
//  },
  created() {
    const self = this
    getAddresses(this.prefix)
      .then(function(abis) {
        self.oracleId = abis.oracleId
      })
    this.updateRegisteredStatus() // TODO: Move to created()?
    window.registerComponent = self // bug workaround used in GitCoin
  },
  methods: {
    updateRegistrationStyles() {
      if (this.registrationDate === undefined) {
        this.noSuchConditionStyle = 'inline'
        this.registerStyle = 'inline'
        this.alreadyRegisterStyle = 'none'
      } else {
        this.noSuchConditionStyle = 'none'
        this.registerStyle = this.conditionId !== undefined ? 'none' : 'inline'
        this.alreadyRegisterStyle = this.conditionId !== undefined ? 'inline' : 'none'
      }
    },
    updateRegisteredStatus() {
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
            [self.registrationDate, self.lastSalaryDate] =
              await Promise.all([
                science.methods.conditionCreationDates(self.conditionId).call(),
                science.methods.lastSalaryDates(self.conditionId).call()])
          } else {
            [self.registrationDate, self.lastSalaryDate] = [undefined, undefined]
          }
          console.log('tt', self.registrationDate, self.lastSalaryDate)
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
      setTimeout(this.updateSalary.bind(this), time - seconds * 1000);
    },
    startShowingSalary() {
      this.updateSalary()
    },
  },
}
</script>

<style src="../assets/Donate.css"></style>
