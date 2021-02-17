# Future Salaries
Clever system for carbon accounting and salaries for scientists and free software developers in Ethereum blockchain.

[Demo app](https://vporton.github.io/future-salary/)

Smart contracts: https://github.com/vporton/future-contracts

To run on your PC:

```sh
yarn
TEST=1 TEST_ACCOUNT=0x... npx truffle deploy --network local
cd donations-widget
yarn
yarn start

# In another terminal:
cd example
yarn start
```

It was [proposed](https://github.com/gitcoinco/web/issues/8183) to integrate this project into [GitCoin](https://gitcoin.co).

[Temporary project homepage.](https://reward.portonvictor.org)

See [this file](TODO) for things to be done. The most hard and important is to test and audit the smart contracts extensively. Consider volunteering for this project.
