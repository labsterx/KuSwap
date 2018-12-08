import { config } from '@/config'

export const sendTx = async function (txObject, userAddress, toAddress, value) {
  const nonce = await window.web3.eth.getTransactionCount(userAddress);

  const txData = txObject.encodeABI()
  // const networkId = await web3.eth.net.getId()

  const txParams = {
    from: userAddress,
    to: toAddress,
    data: txData,
    value: value,
    // chainId: networkId,
    // gasPrice,
  }

  console.log(txParams)

  try {
    const signedTx = await window.web3.eth.sendTransaction(txParams);
    return window.web3.eth.sendSignedTransaction(signedTx.raw);
  } catch (err) {
    console.log(err)
    return null
  }
}

export const getBaseUnitAmount = (amount, decimals) => {
  const amountInBaseUnit = parseFloat(amount) * Math.pow(10, decimals)
  return (parseInt(amountInBaseUnit)).toString()
}

export const getWeb3Accounts = () => {
  return new Promise((resolve, reject) => {
    if (window.web3) {
      window.web3.eth.getAccounts((err, accounts) => {
        if(err !== null) return reject(err)
        return resolve(accounts)
      })
    }
    else {
      console.log('No Web3')
      return reject('No Web3')
    }
  })
}
