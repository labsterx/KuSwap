<template>
<div class="container">

  <div v-if="initializationDone" class="my-3 p-3 text-center">
    <b-row>
      <b-col>
        <!-- srcToken -->
          <div clas="mb-3">
            <strong>FROM:</strong>
          </div>
          <b-form-select v-model.lazy="input.srcToken" class="mb-3 mt-3" v-on:input="handleInputChange">
            <option :value="null" disabled>Select Token</option>
            <option v-for="(option, index) in inputOptions.srcTokens" :value="option.value" :disabled="option.disabled">{{ option.text }}</option>
          </b-form-select>
          <div class="input-error" v-show="inputError.srcTokens">{{ inputError.srcTokens }}</div>
      </b-col>
      <b-col>
        <!-- destToken -->
        <div clas="mb-3">
          <strong>TO:</strong>
        </div>
        <b-form-select v-model.lazy="input.destToken" class="mb-3 mt-3" v-on:input="handleInputChange">
          <option :value="null" disabled>Select Token</option>
          <option v-for="(option, index) in inputOptions.destTokens" :value="option.value">{{ option.text }}</option>
        </b-form-select>
        <div class="input-error" v-show="inputError.destToken || input.expectedRate === 0">{{ inputError.destToken }}</div>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <!-- srcToken Amount -->
        <div clas="mb-2">
          <b-form-input v-model.lazy.number="input.srcAmount"
            type="text"
            placeholder="Amount"
            v-on:input="handleInputChange">
          </b-form-input>
          <div class="input-error" v-show="inputError.srcAmount">{{ inputError.srcAmount }}</div>
        </div>
      </b-col>
      <b-col>
        <!-- destToken Amount -->
        <div clas="mb-2">
          <b-form-input v-model="input.destAmount"
            type="text"
            placeholder="Amount"
            disabled>
          </b-form-input>
        </div>
      </b-col>
    </b-row>

    <div class="text-center my-3">
      <b-btn variant="success" size="lg" :disabled="!readyToSwap()" @click="doSwap">Swap</b-btn>
    </div>

  </div>

  <div class="bg-white text-center my-3 p-3 round-corner" v-show="waitingNetwork">
    <div class="fa-lg text-center mb-2">
    <i class="fa fa-spinner fa-pulse"></i>
    </div>
    <div v-if="waitingMessage" class="preloader-text text-center">{{ waitingMessage }}</div>
  </div>

  <div class="bg-white text-center my-3 p-3 round-corner" v-if="success === true">
     <div class="fa-lg text-center mb-2">
      <i class="fa fa-check-circle color-green"></i>
    </div>
    <div>Done!</div>
  </div>

  <div class="bg-white text-center my-3 p-3 round-corner" v-if="failure === true">
     <div class="fa-lg text-center mb-2">
      <i class="fa fa-exclamation-circle color-red"></i>
    </div>
    <div>Sorry! Transaction Failed!</div>
  </div>

</div>
</template>

<script>

import {mapActions, mapGetters, mapState} from 'vuex'
import {sendTx, getBaseUnitAmount } from '@/utils/utils'
import { BigNumber } from 'bignumber.js'

export default {
  name: 'Home',
  data () {
    return {
      input: {
        srcToken: null,
        destToken: null,
        srcAmount: null,
        destAmount: null,
        expectedRate: null,
      },
      inputOptions: {
        srcTokens: [],
        destTokens: [],
      },
      inputError: {
        srcToken: '',
        destToken: '',
        srcAmount: '',
      },
      inputHasError: false,
      initializationDone: false,
      waitingNetwork: false,
      waitingMessage: null,
      success: null,
      failure: null,
    }
  },
  computed: {
    ...mapGetters({
      config: 'getConfig',
      network: 'getNetwork',
    }),
  },
  components: {
  },
  methods: {
    ...mapActions(['loadNetwork']),
    async init () {
      console.log('home')
      await this.loadNetwork()
      this.getTokenSelectOptions()
      this.initializationDone = true
      console.log(this.network)
      // await this.test()
    },

    readyToSwap () {
      return (this.input.srcToken && this.input.destToken
        && this.input.srcAmount && this.input.destAmount
        && !this.inputHasError)
    },

    getTokenSelectOptions () {
      this.inputOptions.srcTokens = []
      this.inputOptions.destTokens = []
      const tokenList = [ ...this.network.kyberTokenList ]
      tokenList.sort((a,b) => { return a.symbol > b.symbol ? 1 : -1 })
      for (let token of tokenList) {
        const balance = this.network.balance[token.address].toFixed(6)
        const balanceStr = parseFloat(balance)
        const disabled = (balance == 0)
        let optionData = {
          value: token,
          text: token.symbol + ' (' + balanceStr + ')',
          disabled: disabled
        }
        this.inputOptions.srcTokens.push(optionData)
        this.inputOptions.destTokens.push(optionData)
      }
    },

    async cleanUpData () {
      this.initializationDone = false
      this.input = {
        srcToken: null,
        destToken: null,
        srcAmount: null,
        destAmount: null,
        expectedRate: null,
      }
      this.inputOptions = {
        srcTokens: [],
        destTokens: [],
      }
      this.inputError = {
        srcToken: '',
        destToken: '',
        srcAmount: '',
      },
      this.inputHasError = false
      await this.loadNetwork()
      this.getTokenSelectOptions()
      this.initializationDone = true
    },

    async handleInputChange () {

      this.inputError = {
        srcToken: '',
        destToken: '',
        srcAmount: '',
      },
      this.inputHasError = false

      // this.input.destAmount = null
      // this.input.expectedRate = null

      if (this.input.srcAmount > this.network.balance[this.input.srcToken.address]) {
        this.inputHasError = true
        this.inputError.srcAmount = 'amount should be less than ' + this.network.balance[this.input.srcToken.address]
      }

      if (this.inputHasError || !this.input.srcToken || !this.input.destToken || !this.input.srcAmount) {
        return
      }

      const ERC20ABI = this.config.ERC20ABI

      const srcToken = this.input.srcToken
      const destToken = this.input.destToken

      const srcTokenInstance = new window.web3.eth.Contract(ERC20ABI, srcToken.address)
      srcTokenInstance.setProvider(window.web3.currentProvider)
      const destTokenInstance = new window.web3.eth.Contract(ERC20ABI, destToken.address)
      destTokenInstance.setProvider(window.web3.currentProvider)

      const kyberContracts = this.config.network[this.network.id].kyberAPI.contract
      const kyberNetworkProxyInstance = new window.web3.eth.Contract(kyberContracts.KyberNetworkProxy.ABI, kyberContracts.KyberNetworkProxy.address)

      const srcQty = getBaseUnitAmount(this.input.srcAmount, srcToken.decimals)
      // console.log('quality', srcQty)

      const getRate = await kyberNetworkProxyInstance.methods.getExpectedRate(
        srcToken.address,
        destToken.address,
        srcQty.toString()
      ).call()

      console.log('getRate: ' + JSON.stringify(getRate))
      const expectedRate = getRate.expectedRate
      console.log('expectedRate', expectedRate)

      if (!expectedRate) {
        this.inputHasError = true
        this.inputError.srcAmount = 'Sorry, cannot handle this amount'
        return
      }

      this.expectedRate = expectedRate
      this.input.destAmount = (new BigNumber(this.input.srcAmount * expectedRate)).div(10**srcToken.decimals).toFixed(6)

    },

    async doSwap () {

      this.success = null
      this.failure = null

      const ERC20ABI = this.config.ERC20ABI

      const srcToken = this.input.srcToken
      const destToken = this.input.destToken

      const srcTokenInstance = new window.web3.eth.Contract(ERC20ABI, srcToken.address)
      srcTokenInstance.setProvider(window.web3.currentProvider)
      const destTokenInstance = new window.web3.eth.Contract(ERC20ABI, destToken.address)
      destTokenInstance.setProvider(window.web3.currentProvider)

      const kyberContracts = this.config.network[this.network.id].kyberAPI.contract
      const kyberNetworkProxyInstance = new window.web3.eth.Contract(kyberContracts.KyberNetworkProxy.ABI, kyberContracts.KyberNetworkProxy.address)

      // Set allowance
      if (srcToken.symbol !== 'ETH') {
        console.log('set allowance')
        const approveTxData = srcTokenInstance.methods.approve(
          kyberContracts.KyberNetworkProxy.address,
          web3.utils.toWei('99999999'),
        ).encodeABI()
        console.log('approveTxData: ', approveTxData)
        try {
          this.waitingNetwork = true
          this.waitingMessage = "Setting allowance. Please wait"
          const allowanceRes = await web3.eth.sendTransaction({
            from: this.network.userAccount, //obtained from website interface Eg. Metamask, Ledger etc.
            to: srcToken.address,
            data: approveTxData
          })
          console.log(allowanceRes)
          this.waitingNetwork = false
          this.waitingMessage = ""
        } catch (err) {
          console.log(err)
          this.waitingNetwork = false
          this.waitingMessage = ""
          this.failure = true
        }
      }

      // swap
      console.log('swap')

      // Token to Token Swap
      if (srcToken.symbol !== 'ETH' && destToken.symbol !== 'ETH') {

        const srcAmount = getBaseUnitAmount(this.input.srcAmount, srcToken.decimals)
        const minConversionRate = '55555';
        const tradeTxData = kyberNetworkProxyInstance.methods.swapTokenToToken(
          srcToken.address, // srcToken
          srcAmount, // srcAmount
          destToken.address, // destToken
          minConversionRate, // minConversionRate
        ).encodeABI()
        // console.log(tradeTxData)
        try {
          this.waitingNetwork = true
          this.waitingMessage = "Sending Your Trade Request. Please wait"
          const swapRes = await web3.eth.sendTransaction({
              from: this.network.userAccount,
              to: kyberContracts.KyberNetworkProxy.address,
              data: tradeTxData
           })
           console.log(swapRes)
           this.waitingNetwork = false
           this.waitingMessage = ""
           this.success = true
           this.cleanUpData()
        } catch (err) {
          console.log(err)
          this.waitingNetwork = false
          this.waitingMessage = ""
          this.failure = true
        }

      }

      //  Ether to Token
      else if (srcToken.symbol === 'ETH') {

        const srcAmount = getBaseUnitAmount(this.input.srcAmount, srcToken.decimals)
        const minConversionRate = '55555';
        const tradeTxData = kyberNetworkProxyInstance.methods.swapEtherToToken(
          destToken.address, // destToken
          minConversionRate, // minConversionRate
        ).encodeABI()
        // console.log(tradeTxData)
        try {
          this.waitingNetwork = true
          this.waitingMessage = "Sending Your Trade Request. Please wait"
          const swapRes = await web3.eth.sendTransaction({
              from: this.network.userAccount,
              to: kyberContracts.KyberNetworkProxy.address,
              data: tradeTxData,
              value: srcAmount
           })
           console.log(swapRes)
           this.waitingNetwork = false
           this.waitingMessage = ""
           this.success = true
           this.cleanUpData()
        } catch (err) {
          console.log(err)
          this.waitingNetwork = false
          this.waitingMessage = ""
          this.failure = true
        }
      }

      // Token to Ether
      else if (destToken.symbol === 'ETH') {

        const srcAmount = getBaseUnitAmount(this.input.srcAmount, srcToken.decimals)
        const minConversionRate = '55555';
        const tradeTxData = kyberNetworkProxyInstance.methods.swapTokenToEther(
          srcToken.address, // destToken
          srcAmount,
          minConversionRate, // minConversionRate
        ).encodeABI()
        // console.log(tradeTxData)
        try {
          this.waitingNetwork = true
          this.waitingMessage = "Sending Your Trade Request. Please wait"
          const swapRes = await web3.eth.sendTransaction({
              from: this.network.userAccount,
              to: kyberContracts.KyberNetworkProxy.address,
              data: tradeTxData
           })
           console.log(swapRes)
           this.waitingNetwork = false
           this.waitingMessage = ""
           this.success = true
           this.cleanUpData()
        } catch (err) {
          console.log(err)
          this.waitingNetwork = false
          this.waitingMessage = ""
          this.failure = true
        }
      }

      // Shouldn't be here. Invalid input
      else {
        console.log('invalid input')
      }

    }
  },
  created () {
    this.init()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.input-error {
  font-size: 0.8rem;
  color: red;
  margin: 5px;
}
.round-corner {
  border-radius: 6px;
}
</style>
