<template>
  <div>
    <p>
      <small>
        <span style="color: red">No warranty!</span> Not all smart contracts were audited.
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/TechRate/Smart-Contract-Audits/blob/main/Future%20Salaries%20%20Smart%20Contract%20Audit.pdf"
        >
          Audit report.
        </a>
      </small>
    </p>
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
          <span :style="{display: isDefaultID}">
            (Your default condition ID)
          </span>
          <button @click="setDefaultID" :style="{display: showGoToDefault}">
            Go to default ID
          </button>
          <button @click="setDefaultID" :style="{display: showResetDefault}">
            Reset
          </button>
          {{' '}}
          <button @click="showRegistrationData" :style="{display: this.conditionId !== undefined ? 'inline' : 'none'}">
            Show data for other sites
          </button>
        </span>
        <span :style="{display: noSuchConditionStyle, color: 'red'}"><br/>No such condition ID</span>
    </p>
    <p>
        <button
          class="donateButton"
          :style="{display: registerStyle}"
          @click="register"
        >Register for a salary (create condition ID)</button>
        <span :style="{display: alreadyRegisterStyle, textAlign: 'left'}">
          <label><input type="checkbox" v-model="advancedMode"/> <small>Show advanced dangerous controls</small></label>
          <br/>
          <label>Salary recipient:</label> <code class="ethereumAddress">{{salaryRecipient}}</code>
          <span :style="{display : advancedMode ? 'inline' : 'none'}">
            {{' '}}
            <button @click="changeRecipient">Change...</button>
          </span>
          <br/>
          <label>Controlled by notary:</label> <small>(you control yourself)</small>
          <span :style="{display : advancedMode ? 'inline' : 'none'}">
            {{' '}}
            <button>Make managed...</button>
          </span>
          <br/>
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
            Registration is free. The earlier you register, the more money you get.
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
    <vue-modal-2
      name="registeringDialog"
      @on-close="closeRegisteringDialog"
      :headerOptions="{
        title: 'You are being registered.',
      }"
      :footerOptions="{
        btn1: 'Close',
        btn2Style: {
          display: 'none',
        },
        btn1OnClick: () => {
          $vm2.close('registeringDialog');
        },
      }"
    >
      <p>Don't close the window.</p> <!-- TODO: Prevent closing browser window. -->
    </vue-modal-2>
    <vue-modal-2
      name="salaryRecipientAddressDialog"
      @on-close="closeSalaryRecipientAddressDialog"
      :headerOptions="{
        title: 'Enter new salary recipient account.',
      }"
      :footerOptions="{
        btn2: 'OK',
        btn1Style: {
          display: 'none',
        },
        btn2OnClick: () => {
          if (this.$refs.newSalaryRecipientWidget.isValid()) {
            this.doChangeRecipient()
          } else {
            this.enterValidAddressWarning()
          }
        },
      }"
    >
      <p style="color: red">This operation is not reversible!!</p>
      <p>New salary recipient: <EthAddress ref="newSalaryRecipientWidget" v-model="newSalaryRecipient"/>.</p>
    </vue-modal-2>
    <vue-modal-2
      name="mintingTakeSalaryDialog"
      @on-close="closeMintingTakeSalaryDialog"
      :headerOptions="{
        title: 'Salary owner\'s token minting...',
      }"
      :footerOptions="{
        btn1: 'Close',
        btn2Style: {
          display: 'none',
        },
        btn1OnClick: () => {
          $vm2.close('closeMintingTakeSalaryDialog');
        },
      }"
    >
      <p>Don't close the window.</p> <!-- TODO: Prevent closing browser window. -->
    </vue-modal-2>
    <vue-modal-2
      name="registeredDialog"
      :style="{fontSize: '60%', textAlign: 'left'}"
      modalSize="full-w"
      @on-close="closeRegisteredDialog"
      :headerOptions="{
        title: 'You have been registered.',
      }"
      :footerOptions="{
        btn1: 'Close',
        btn2Style: {
          display: 'none',
        },
        btn1OnClick: () => {
          $vm2.close('registeredDialog');
        },
      }"
    >
      <div :style="{margin: '1ex'}">
        <p><strong>Write down</strong> your condition ID (kinda your salary account):
          <code :style="{color: 'red'}">{{`${networkname}/${conditionId}`}}</code>.</p>
        <p>Now to make your salary calculation work (if you don't, you are not to receive a salary),
          you need to enter the following data.
        <!-- Causes damaging the URL fragment. -->
        <!--ul>
          <li><a href="#orcidData" @click="scroll">For scientists</a></li>
          <li><a href="#githubData" @click="scroll">For software developers</a></li>
          <li><a href="#wikidata" @click="scroll">For organizations</a></li>
        </ul-->
        <ul>
          <li>For scientists</li>
          <li>For software developers</li>
          <li>For organizations</li>
        </ul>
        <h2 id="orcidData">ORCID</h2>
        <p>If you are a scientist, enter the following data as <strong>Funding</strong>
          in <a target="_blank" href="https://orcid.org/signin">ORCID site</a>:</p>
        <dl>
          <dt>Funding type</dt><dd>Anything you want to enter</dd>
          <dt>Title of funded project</dt><dd>Your full name (or anything, if you want to stay anonymous)</dd>
          <dt>Funding agency display name</dt><dd><code>Future Salaries</code>
            (Enter exactly this, with one space between words, no spaces before and after,
            the same capitalization, etc.)</dd>
          <dt>Funding agency display country</dt><dd><code>Israel</code></dd>
          <dt>Funding agency display city</dt><dd><code>Ashkelon</code></dd>
          <dt>Grant number</dt><dd><code>{{`${networkname}/${conditionId}`}}</code></dd>
          <dt>Relationship</dt><dd><code>Self</code></dd>
          <dt>Grant URL</dt><dd><code>https://vporton.github.io/future-salary/</code></dd>
          <dt>Set visibility</dt>
          <dd>
            <code>everyone</code> (recommended for maximum salary) or
            <code>trusted parties</code> (not recommended)
          </dd>
        </dl>
        <p>You can leave the rest fields blank.</p>
        <p>Note that for a given <q>network</q> like <code>{{`${networkname}`}}</code> you should have only one
          <q>condition ID</q> <code>{{conditionId}}</code> at ORCID site. (You can have multiple salary streams
          for multiple networks, but if for a single network you enter multiple condition IDs in ORCID site,
          you may be even banned.)</p>
        <h2 id="githubData">GitHub</h2>
        <p>If you are a software developer, create a JSON file <code>.future-salaries/accounts.json</code>
          (the file <code>accounts.json</code>  in the folder <code>.future-salaries</code>)
          of the following content in the repository
          <code>USER/USER</code> (where USER is your user name) with the following content:</p>
        <!-- TODO: Make this file downloadable. -->
        <pre>[
  {
    "ethereumNetwork": "{{networkname}}",
    "conditionId": {{conditionId}}
  }
]</pre>
        <p>You can have it enumerated through comma for multiple networks and/or oracle IDs.
          (See any tutorial about JSON for the file format.)</p>
        <p>Note that for a given <code>ethereumNetwork</code> you should have only one
          <code>conditionId</code>. (You can have multiple salary streams for multiple networks,
          but if for a single network you enter multiple condition IDs, you may be even banned.)</p>
        <p>It is OK to have the same <code>.future-salaries/accounts.json</code> file in multiple GitHub repositories.
          Also please add the same file to other your Git hosts (BitBucket, GitLab, etc.)</p>
        </div>
    </vue-modal-2>
  </div>
</template>

<script>
import Web3 from 'web3'
import Vue from 'vue'
import Modal from "@burhanahmeed/vue-modal-2"
import { isUint256Valid, mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'
import EthAddress from '@/components/EthAddress.vue'
import Uint256 from '@/components/Uint256.vue'

const BN = Web3.utils.BN

Vue.use(Modal);

export default {
  name: 'Register',
  props: [
    'prefix',
    'chainid',
    'oracleid',
    'networkname',
    'providerurl',
    'initialconditionid',
    'web3Getter',
  ],
  components: {
    EthAddress,
    Uint256,
  },
  data() {
    const conditionId = this.initialconditionid === undefined || this.initialconditionid === ''
      ? undefined : this.initialconditionid
    return {
      web3: null,
      currentOracleId: null,
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
      showGoToDefault: 'none',
      showResetDefault: 'none',
      timeoutHandle: null,
      salaryRecipient: undefined,
      amountOnAccount: undefined,
      amountOnAccountFormatted: '',
      salaryRecipientEvents: [],
      tokenIdEvents: [],
      advancedMode: false,
      newSalaryRecipient: '',
    }
  },
  watch: {
    conditionId() {
      this.onConditionChange()
    },
    oracleid() { // needed?
      this.onConditionChange()
    },
    salaryRecipient() {
      this.updateAmountOnAccount()
    },
    tokenId() {
      const self = this
      async function doIt() {
        const web3 = await self.getWeb3();
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
    },
    networkname() {
      // TODO: Is the following correct?
      const self = this
      async function doIt() {
        self.web3 = self.web3Getter ? await self.web3Getter() : window.web3 // Duplicate code
        const abis = await self.myGetAddresses(self.prefix);
        self.currentOracleId = abis ? abis.oracleId : null
      }
      doIt()
      if (!self.networkname) {
        self.lastSalaryDate = undefined
        self.amountOnAccount = undefined
        self.registrationDate = undefined
        self.updateRegistrationStyles()
      } else {
        this.updateAmountOnAccount()
        this.updateRegisteredStatus()
        this.updateRegistrationStyles()
      }
    },
  },
  created() {
    const self = this
    self.myGetAddresses(self.prefix)
      .then(function(abis) {
        self.currentOracleId = self.oracleid !== undefined ? self.oracleid : (abis ? abis.oracleId : null);
      })
    self.onUpdateConditionId()
    self.updateRegisteredStatus()
    if(!self.networkname) {
      self.updateRegistrationStyles()
    }
    window.registerComponent = self // bug workaround used in GitCoin
  },
  methods: {
    async myGetAddresses(PREFIX) {
      return await getAddresses(PREFIX, this.networkname)
    },
    enterValidAddressWarning() {
      global.alert('Enter valid address!')
    },
    withdraw() {
      const self = this
      async function doIt() {
        const web3 = await self.getWeb3();
        const account = (await getAccounts(web3))[0];
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
            await self.getWeb3(), science,
            science.methods.mintSalary,
            [self.conditionId, []],
            {from: account},
            null)
          await tx
          self.updateAmountOnAccount()
        } 
      }
      doIt();
    },
    async changeRecipient() {
      const web3 = await this.getWeb3();
      const addresses = await this.myGetAddresses(this.prefix);
      if (!addresses) return;
      const account = (await getAccounts(web3))[0];
      try {
        const ourAbi = (await getABIs(this.prefix)).NFTRestoreContract;
        const nft = new web3.eth.Contract(ourAbi, addresses.NFTRestoreContract.address);
        try {
          await nft.methods.ownerOf(account).call({from: account})
        }
        catch(e) {
          this.$vm2.open('mintingTakeSalaryDialog');
          try {
            const tx = await mySend(
              await this.getWeb3(), nft,
              nft.methods.mintRestoreRight,
              [[]],
              {from: account},
              null)
            await tx
          }
          finally {
            this.$vm2.close('mintingTakeSalaryDialog');
          }
        }
        this.$vm2.open('salaryRecipientAddressDialog');
      }
      catch(e) {
        alert(e.message);
      }
    },
    async doChangeRecipient() {
      const web3 = await this.getWeb3();
      const addresses = await this.myGetAddresses(this.prefix);
      if (!addresses) return;
      const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO
      const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address)
      const account = (await getAccounts(web3))[0];
      console.log('qqq', [this.salaryRecipient, this.newSalaryRecipient, account])
      try {
        const tx = await mySend(
          await this.getWeb3(), science,
          science.methods.restoreFunds,
          [this.salaryRecipient, this.newSalaryRecipient, account],
          {from: account},
          null)
        await tx
      }
      finally {
        this.$vm2.close('salaryRecipientAddressDialog');
      }
    },
    updateAmountOnAccount() {
      const self = this
      if (!self.networkname) {
        // Hack.
        self.lastSalaryDate = undefined
        self.amountOnAccount = undefined
        self.registrationDate = undefined
        self.updateRegistrationStyles()
      }
      async function doIt() {
        const web3 = await self.getWeb3();
        // FIXME: Races!
        // It may be more efficient to use directly the Salary contract, but be aware of race conditions:
        const addresses = await self.myGetAddresses(self.prefix);
        if (self.conditionId !== undefined && addresses) {
          if (web3) {
            const scienceAbi = (await getABIs(self.prefix)).SalaryWithDAO;
            const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
            const wrapperAbi = (await getABIs(self.prefix)).UnitedSalaryTokenWrapper;
            const wrapper = new web3.eth.Contract(wrapperAbi, addresses.UnitedSalaryTokenWrapper.address);

            if (self.salaryRecipient === undefined || /^0x0+$/.test(self.salaryRecipient)) {
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
        const web3 = await self.getWeb3();
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
      this.isDefaultID = this.conditionId == this.initialconditionid && this.conditionId !== undefined ? 'inline': 'none'
      this.showGoToDefault =
        this.conditionId !== this.initialconditionid &&
        this.initialconditionid !== undefined &&
        this.initialconditionid !== ''
        ? 'inline': 'none'
      this.showResetDefault =
        this.conditionId !== this.initialconditionid &&
        (this.initialconditionid === undefined || this.initialconditionid === '')
        ? 'inline': 'none'
    },
    setDefaultID() {
      this.conditionId = this.initialconditionid
      this.updateRegisteredStatus()
    },
    updateRegistrationStyles() {
      if (!this.networkname || this.registrationDate === undefined) {
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
      if (!self.networkname) return; // hack
      async function loadData() {
        const web3 = await self.getWeb3();
        const account = (await getAccounts(web3))[0];
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
      if (self.networkname && self.conditionId !== undefined && isUint256Valid(self.conditionId)) {
        loadData()
        self.startShowingSalary()
      } else {
        self.updateRegistrationStyles()
      }
    },
    addRegisterCallback(f) { // bug workaround used in GitCoin
      this.registerCallbacks.push(f)
    },
    closeRegisteringDialog() {
      this.$vm2.close('registeringDialog')
    },
    closeRegisteredDialog() {
      this.$vm2.close('registeredDialog')
    },
    closeSalaryRecipientAddressDialog() {
      this.$vm2.close('salaryRecipientAddressDialog')
    },
    closeMintingTakeSalaryDialog() {
      this.$vm2.close('mintingTakeSalaryDialog')
    },
    async register() {
      const self = this
      const web3 = await this.getWeb3();
      const account = (await getAccounts(web3))[0];
      if (web3 && account !== undefined) {
        const addresses = await self.myGetAddresses(this.prefix);
        if (!addresses) return;
        const scienceAbi = (await getABIs(this.prefix)).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
        try {
          self.$vm2.open('registeringDialog');
          const tx = await mySend(await self.getWeb3(), science, science.methods.registerCustomer, [account, true, []], {from: account}, null);
          const txData = await tx;
          this.$vm2.close('registeringDialog');
          self.conditionId = txData.events.ConditionCreated.returnValues.condition;
          self.updateRegisteredStatus(); // Call it even if self.conditionId didn't change.
          this.$emit('conditionCreated', self.conditionId);
          self.showRegistrationData();
          for(let f of self.registerCallbacks) {
            f(self.conditionId);
          }
        }
        catch(e) {
          this.$vm2.close('registeringDialog');
          alert(/You are already registered\./.test(e.message) ? "You are already registered." : e.message);
        }
      }
    },
    showRegistrationData() {
      this.$vm2.open('registeredDialog');
    },
    scroll(event) {
      const href = event.target.getAttribute('href');
      const elt = document.getElementById(href.replace(/^#/, ''));
      const parent = document.querySelector('.vm2_body')
      parent.scrollTop = elt.top // Why `parent.scrollTop == 0` always?!
      event.preventDefault()
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
      return this.web3 = this.web3Getter ? await this.web3Getter() : window.web3 // Duplicate code
    },
    onConditionChange() {
      // this.updateRegisteredStatus()

      const self = this
      async function doIt() {
        const web3 = await self.getWeb3();
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
  },
}
</script>

<style src="../assets/Donate.css"></style>
