<template>
  <p style="margin: 7px; line-height: 70%">
    <small>
      Donate for app development and marketing:
      <br/>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://gitcoin.co/grants/1591/science-of-the-future-the-100-years-forward-plan"
        style="margin: 5px; color: red"
      >by crypto</a> |
      <a
        href="#"
        @click.prevent="initCardAppDonation"
        style="margin: 5px; color: red"
      >by credit card</a>
    </small>
  </p>
</template>

<script>
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

export default {
  name: 'DonateForApp',
  methods: {
    async initCardAppDonation() {
      new RampInstantSDK({
        hostAppName: 'Future Salaries App Development',
        hostLogoUrl: 'https://vporton.github.io/future-salary/noun_salary_1453098.svg',
        swapAsset: 'BNB,ADA,ETH,USDT,XDAI',
        userAddress: '0x722cE03C15670c313f9596544CDB582c19f810e2',
        // hostApiKey: TODO,
      }).show();
    },
  },
}
</script>
