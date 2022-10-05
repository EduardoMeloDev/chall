import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import type { Container, Engine } from "tsparticles-engine";
import { useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { getDefaultProvider } from 'ethers'
import { useEthers } from '@usedapp/core'



const Home: NextPage = () => {

  const { account, activateBrowserWallet } = useEthers()

  const login = async () => {
    activateBrowserWallet();
  };


  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);

    // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);


  return (
    <> 
    <Head>
        <title>Login</title>
    </Head>
    <div className={styles.container}>
        <h1 className={styles.subheading}></h1>
     
        {account ? (
                      <>
                        <div>user</div>
                        <div>{account}</div>
                      </>
                    ) : (
                      <>
                        <button className={styles.button} onClick={login} > Connect with Metamask</button>
                      </>
                    )}        
    </div>
</>
     
  )
}

export default Home
