<template>
  <div>
    <p style="color: red">This is demo version for a testnet. Contracts are not audited yet.</p>
    <p>
        <small>
            Free software authors, scientists/inventors, science/software publishers, carbon accounters,
            and other common good producers:
        </small>
    </p>
    <p>
        <button class="donateButton" @click="register">Register for a salary</button>
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
import { getWeb3, mySend, getABIs, getAccounts, getAddresses } from '../utils/AppLib'

export default {
  name: 'Register',
  // props: ['oracleId'],
  data() {
    return {
      oracleId: null,
    }
  },
  created() {
    getAddresses()
      .then(function(abis) {
        this.oracleId = abis.oracleId
    })
  },
  methods: {
    async register() {
      const web3 = await getWeb3();
      const account = (await getAccounts())[0];
      if (web3 && account !== null) {
        const addresses = await getAddresses();
        if (!addresses) return;
        const scienceAbi = (await getABIs()).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, addresses.SalaryWithDAO.address);
        console.log(account, this.oracleId, true, []) // FIXME: remove
        await mySend(science, science.methods.registerCustomer, [account, this.oracleId, true, []], {from: account}, null)
          .catch(e => {
            alert(/You are already registered\./.test(e.message) ? "You are already registered." : e.message);
          });
      }
    }
  },
}
</script>

<style src="../assets/Donate.css"></style>
