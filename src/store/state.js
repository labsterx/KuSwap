import { config } from '@/config'

const network = {
  hasMetaMask: false,
  networkSupported: false,
  id: null,
  name: '',
  metaMaskLoggedIn: false,
  userAccount: null,
  kyberTokenList: [],
  balance: {}
}

export default {
  config,
  network
}
