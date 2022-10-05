import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { getDefaultProvider } from 'ethers'
import { Mainnet, DAppProvider, useEtherBalance, useEthers, Config, Goerli, Ropsten } from '@usedapp/core'

const config: Config = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider('mainnet'),
    [Ropsten.chainId]: getDefaultProvider('ropsten'),
  },
}


function MyApp({ Component, pageProps }: AppProps) {
  return  (
  <DAppProvider config={config}>
  <Component {...pageProps} />
  </DAppProvider>
  )
}

export default MyApp
