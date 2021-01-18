import Web3 from 'web3'

const { toBN } = Web3.utils;

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545") // hack

export default {
    isRealNumber: function(value) {
        return /^[0-9]+(\.[0-9]+)?$/.test(value)
    },
    isEthAddressValid: function(value) {
        return web3.utils.isAddress(value)
    },
    isUint256Valid: function(v) {
        return /^[0-9]+$/.test(v) && toBN(v).lt(toBN(2).pow(toBN(256)))
    },
}
