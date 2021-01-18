<template>
  <div>
    <p>
      <small>Free software authors, scientists/inventors, science/software publishers,
        carbon accounters, and other common good producers:</small>
      <br/>
      <a href="/register">Register for a salary.</a>
      <br/>
      <small>Registration is free (except of an Ethereum network fee). The earlier you register, the more money you get.</small>
    </p>
    <h1>Donate / Bequest</h1>
    <p>
      This is <strong>the</strong> donation app. Don't use KickStarter/GoFundMe
      anymore, <em>donate or bequest</em> here for the software and the free
      market to choose the best donation recepient.
    </p>
    <p style="color: red">
      This is demo version for a testnet. Contracts are not audited yet.
    </p>
    <p>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="this.paymentKind = 'donate';"
          checked=""
        />
        &nbsp;Donate
      </label>
      <label>
        <input
          type="radio"
          name="paymentKind"
          onclick="this.paymentKind = 'bequestGnosis';"
          checked=""
        />
        &nbsp;Bequest all funds on a Gnosis Safe smart wallet
      </label>
    </p>
    <p :style="{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}">
      Donation in:
      <label>
        <input
          type="radio"
          name="tokenKind"
          onclick="this.tokenKind = 'erc1155';"
        />
        &nbsp;ERC-1155
      </label>
      <small>(recommended)</small>
      <label>
        <input type="radio" name="tokenKind" onclick="this.tokenKind = 'erc20';" />
        &nbsp;ERC-20
      </label>
      <br />
      <small>(Don't use stablecoins for long-time funding.)</small>
    </p>
    <p>
      <span :style="{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}">Wallet address:</span>
      <span :style="{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}">Token address:</span>
      <EthAddress
        :value="tokenEthAddress"
      />
    </p>
    <p style="{display: paymentKind !== 'bequestGnosis' && tokenKind === 'erc1155' ? 'block' : 'none'}">
      Token ID:
      <Uint256 :value="tokenId" onchange="this.tokenId = event.target.value;" />
    </p>
    <p :style="{display: paymentKind !== 'donate' ? 'block' : 'none'}">
      <span :style="{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}">The bequest can be taken after:</span>
      <span :style="{display: paymentKind !== 'bequestGnosis' ? 'inline' : 'none'}">
        {{bequestDate !== null ? bequestDate.toString() : ""}}
      </span>
      <span :style="{display: paymentKind === 'bequestGnosis' ? 'inline' : 'none'}">
        <br />
        <span style="display: inline-block">
          <!--Calendar onchange="setBequestDate(e)" value="" minDate=""/-->
        </span>
      </span>
    </p>
    <div :style="{display: paymentKind !== 'bequestGnosis' ? 'block' : 'none'}">
      <p>
        Donation amount:
        <Amount :value="amount" onchange="this.amount = event.target.value;" />
        <button @click="donate" :disabled.prop="{donateButtonDisabled()}">Donate</button>
      </p>
    </div>
    <p :style="{display: paymentKind === 'bequestGnosis' ? 'block' : 'none'}">
      <button class="donateButton" :disabled.prop="bequestButtonDisabled()" @click="bequestAll">
        Bequest!
      </button>
    </p>
  </div>
</template>

<script>
import EthAddress from '@/components/EthAddress.vue'
import Uint256 from '@/components/Uint256.vue'
import Amount from '@/components/Amount.vue'
import '../utils/AppLib'

export default {
  name: 'Donate',
  components: {
    EthAddress,
    Uint256,
    Amount,
  },
  watch: {
    oracleId(v) {
      async function updateInfo() {
        const web3 = await getWeb3();
        if (web3 !== null) {
          const contractEthAddress = await lockContract();
          if (contractEthAddress !== '') {
            const scienceAbi = (await getABIs()).SalaryWithDAO;
            const science = new web3.eth.Contract(scienceAbi, contractEthAddress);
            const account = (await getAccounts())[0];
            if(!account) {
              // setConnectedToAccount(false); // TODO
              return;
            }
            setBequestDate(new Date(await science.methods.minFinishTime(oracleId).call() * 1000));
          }
        }
      }
      updateInfo();
    },
  },
  data() {
    return {
      oracleId: '0', // FIXME
      donateFor: '',
      paymentKind: 'bequestTokens',
      tokenKind: '',
      bequestDate: null,
      tokenEthAddress: '',
      tokenId: '',
      amount: '',
    }
  },
  async obtainERC1155Token() {
    let collateralContractEthAddress, collateralTokenId;
    switch(tokenKind) {
      case 'erc1155':
        collateralContractEthAddress = tokenEthAddress;
        collateralTokenId = tokenId;
        break;
      case 'erc20':
        collateralContractEthAddress = (await getEthAddresses()).ERC1155OverERC20.address;
        collateralTokenId = Web3.utils.toHex(tokenEthAddress);

        const web3 = await getWeb3();
        // if (web3 === null) return;
        const account = (await getAccounts())[0];
        // if(!account) return;

        // Approve ERC-20 spent
        const erc20 = new web3.eth.Contract(erc20Abi  , tokenEthAddress);
        const allowanceStr = await erc20.methods.allowance(account, collateralContractEthAddress).call();
        const allowance = toBN(allowanceStr);
        const halfBig = toBN(2).pow(toBN(128));
        if(allowance.lt(halfBig)) {
          const big = toBN(2).pow(toBN(256)).sub(toBN(1));
          const tx = await mySend(erc20, erc20.methods.approve, [collateralContractEthAddress, big.toString()], {from: account}, null)
            // .catch(e => alert(e.message));
          await tx;
        }
        break;
    }
    return [collateralContractEthAddress, collateralTokenId];
  },
  async lockContract() {
    const addresses = await getEthAddresses();
    switch (donateFor) {
      case 'science':
        return addresses.SalaryWithDAO.address;
      case 'climate':
        return addresses.Lock.address;
      default:
        return '';
    } 
  },
  async donate() {
    const wei = toWei(amount);
    const web3 = await getWeb3();
    if (web3 !== null) {
      try {
        const contractEthAddress = await lockContract();
        const scienceAbi = (await getABIs()).SalaryWithDAO;
        const science = new web3.eth.Contract(scienceAbi, contractEthAddress);
        const account = (await getAccounts())[0];
        if(!account) {
          // setConnectedToAccount(false); // TODO
          return;
        }
        const [collateralContractEthAddress, collateralTokenId] = await obtainERC1155Token();
        const collateralContract = new web3.eth.Contract(erc1155Abi, collateralContractEthAddress);
        const approved = await collateralContract.methods.isApprovedForAll(account, contractEthAddress).call();
        if (!approved) {
          const tx = await mySend(
            collateralContract, collateralContract.methods.setApprovalForAll,
            [contractEthAddress, true], {from: account}, null
          );
          await tx;
        }
        switch(paymentKind) {
          case 'donate':
            await mySend(science, science.methods.donate,
              [collateralContractEthAddress,
              collateralTokenId,
              oracleId,
              wei,
              account,
              account,
              []],
              {from: account}, null
            );
            break;
          case 'bequestTokens':
            await mySend(science, science.methods.bequestCollateral,
              [collateralContractEthAddress,
              collateralTokenId,
              oracleId,
              wei,
              account,
              []],
              {from: account}, null
            );
            break;
        }
      }
      catch(e) {
        alert(e.message);
      }
    }
  },
  async bequestAll() {
    alert("Bequesting all funds is not yet supported!");
  },
  donateButtonDisabled() {
    return !isRealNumber(amount) || donateFor === '' || paymentKind === '' || tokenKind === '' ||
      !isEthAddressValid(tokenEthAddress) || (tokenKind === 'erc1155' && !isUint256Valid(tokenId));
  },
  bequestButtonDisabled() {
    return !isEthAddressValid(tokenEthAddress) || bequestDate === null;
  },
}
</script>

<style src="../assets/Donate.css"></style>
