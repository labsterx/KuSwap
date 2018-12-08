import { ERC20ABI } from '@/config/ABI/ERC20ABI'
import { ABI_KyberNetworkProxy} from '@/config/ABI/kyber/KyberNetworkProxy'
import { ABI_KyberNetwork} from '@/config/ABI/kyber/KyberNetwork'

export const config = {
  supportedNetworks: {
    1: 'Main Ethereum Network',
    3: 'Ropsten Testnet',
    // 42: 'Kovan Testnet',
  },
  ERC20ABI,
  ETHFakeAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  network: {

    1: {
      kyberAPI: {
        supportedTokens: 'https://api.kyber.network/currencies',
        priceAndVolume: 'https://tracker.kyber.network/api/tokens/pairs',
        contract: {
          KyberNetworkProxy: {
            address: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
            ABI: ABI_KyberNetworkProxy
          },
          KyberNetwork: {
            address: '0x91a502C678605fbCe581eae053319747482276b9',
            ABI: ABI_KyberNetwork
          }
        }
      }
    },

    3: {
      kyberAPI: {
        supportedTokens: 'https://ropsten-api.kyber.network/currencies',
        priceAndVolume: 'https://tracker.kyber.network/api/tokens/pairs',
        contract: {
          KyberNetworkProxy: {
            address: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
            ABI: ABI_KyberNetworkProxy
          },
          KyberNetwork: {
            address: '0x91a502C678605fbCe581eae053319747482276b9',
            ABI: ABI_KyberNetwork
          }
        }
      }
    },

  }
}
