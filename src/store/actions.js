import { config } from '@/config'
import { getWeb3Accounts } from '@/utils/utils'
import * as Web3 from 'web3'
import Vue from 'vue'
import { BigNumber } from 'bignumber.js'

// console.log ('action.js')

// --------------------------------------------------------
let NETWORK = {
  id: null,
  name: null
}
let HAS_MATAMASK = false
let MATAMASK_DENIED_ACCESS = false
let MY_ACCOUNT = null
let WRONG_NETWORK = false
let WEB3_READY = false

async function _loadWeb3 () {

  const result = {
    web3Ready: false,
    web3Denied: false,
    hasMetaMask: true,
    userAccount: null,
  }

  window.WEB3_WAITING = true
  // get window.web3 ready
  if (window.ethereum) {
    console.log('create web3 from window.ethereum')
    window.web3 = new Web3(ethereum);
    try {
      // Request account access if needed
      await ethereum.enable()
      result.ready = true
      WEB3_READY = true

    } catch (error) {
      console.log('user denied metamask access')
      result.web3Denied = true
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    console.log('using old web3')
    window.web3 = new Web3(web3.currentProvider);
    result.ready = true
    WEB3_READY = true
  }
  // Non-dapp browsers...
  else {
    console.log('No Web3')
    result.hasMetaMask = false
    window.WEB3_WAITING = false
    return result
  }

  console.log(window.web3)
  console.log('Using Web3 Version: ', window.web3.version)

  // Get Network ID
  const networkId = await window.web3.eth.net.getId()
  console.log('networkID', networkId)

  // Get User Account
  const accounts = await getWeb3Accounts()
  MY_ACCOUNT = accounts[0].toLowerCase()

  if (config.supportedNetworks[networkId]) {
    NETWORK.id = networkId
    NETWORK.name = config.supportedNetworks[networkId]
  }
  else {
    WRONG_NETWORK = true
  }

  window.WEB3_WAITING = false
  return result

}

async function _getKyberTokens (networkId) {

  const url = config.network[networkId].kyberAPI.supportedTokens
  const res = await Vue.http.get(url)
  return res.body.data

}

function _loadTokenBalance (contractAddress, myAddress, decimals) {
  if (contractAddress === config.ETHFakeAddress) {
    return web3.eth.getBalance(myAddress)
  }
  else {
    const tokenInstance = new window.web3.eth.Contract(config.ERC20ABI, contractAddress);
    tokenInstance.setProvider(window.web3.currentProvider);
    return web3.eth.call({
      to: contractAddress,
      data: tokenInstance.methods.balanceOf(myAddress).encodeABI()
    })
  }
}

// --------------------------------------------------------
async function _init () {

  // load web3
  const web3Status = await _loadWeb3()
  // console.log(web3Status)
  HAS_MATAMASK = web3Status.hasMetaMask
  MATAMASK_DENIED_ACCESS = web3Status.web3Denied
  if (!HAS_MATAMASK || MATAMASK_DENIED_ACCESS) {
    return
  }

  return

}

// --------------------------------------------------------
async function _loadNetwork() {
  await _init()
  const network = {
    hasMetaMask: HAS_MATAMASK,
    networkSupported: false,
    id: null,
    name: '',
    metaMaskLoggedIn: false,
    userAccount: null,
  }

  if (!HAS_MATAMASK || MATAMASK_DENIED_ACCESS) {
    return network
  }

  // if matamask installed
  if (NETWORK && NETWORK.id) {
    network.id = NETWORK.id
  }
  if (NETWORK && NETWORK.name) {
    network.name = NETWORK.name
  }

  if (!WRONG_NETWORK) {
    network.networkSupported = true
  }
  else {
    return network
  }

  if (MY_ACCOUNT) {
    network.userAccount = MY_ACCOUNT
  }

  const kyberTokenList = await _getKyberTokens(network.id)
  // console.log(kyberTokenList)
  network.kyberTokenList = kyberTokenList

  const balanceTasks = []
  const tokenBalance = {}
  for (let token of kyberTokenList) {
    let getBalance = _loadTokenBalance(token.address, network.userAccount, token.decimals)
    .then( data => {
      const rawBalance = new BigNumber(window.web3.utils.hexToNumberString(data))
      const balance = rawBalance.div(10**token.decimals)
      tokenBalance[token.address] = balance.toNumber()
    })
    balanceTasks.push(getBalance)
  }

  await Promise.all(balanceTasks).then(function() {
    // console.log(tokenBalance)
    network.balance = tokenBalance
  })

  return network

}



// --------------------------------------------------------
//
// --------------------------------------------------------

export default {

  // --------------------------------------------------------
  async loadNetwork ({commit, state, dispatch}) {

    const network = await _loadNetwork()
    commit('setNetwork', network)
    return
  },


}
