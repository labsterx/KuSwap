### KuSwap

## About

KuSwap is an instant token swap web app hosted on IPFS and interacts with Kyber's smart contract. It is a barebones but intuitive interface that allows any user (especially those new to the cryptocurrency space) to easily swap between different ERC20 tokens including Ether. As KuSwap is hosted on IPFS, it's more decentralized than other similar dapps.

## Technical Details

Vue.js was used to build the static website. Web3.js, MetaMask and Infura were used to connect the UI to the Kyber smart contracts. The static files were bundled and then uploaded to an IPFS node, which was set up on DigitalOcean. An IPFS hash for the hosted files was then generated to allow access to the UI. To make it easier for users to access KuSwap. The domain name KuSwap.com was registered and CloudFlare was used to map the IPFS hosted UI to the domain name.

## Access

Via IPFS Gateways:

https://ipfs.io/ipfs/QmZggB5qTGYSSfZgM5n7359eRziCeHuUujZzS3dMVKbtH7
https://cloudflare-ipfs.com/ipfs/QmZggB5qTGYSSfZgM5n7359eRziCeHuUujZzS3dMVKbtH7

Via Domain Name:

http://www.kuswap.com/

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

```

