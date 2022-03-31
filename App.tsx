import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Connection, Keypair, Transaction, clusterApiUrl, PublicKey } from '@solana/web3.js'
import fetch from 'cross-fetch'
import bs58 from 'bs58'

const connection = new Connection('https://ssc-dao.genesysgo.net')


const wallet = Keypair.fromSecretKey(bs58.decode('paste-here-your-secretKey-in-bs58'))
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

async function getRoutes(fromMint: string, toMint: string, amount: string, slippage: string) {
  // swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
  const { data } = await (
    await fetch(
      `https://quote-api.jup.ag/v1/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}&slippage=${slippage}&feeBps=4`
    )
  ).json()
  const routes = data

  // get serialized transactions for the swap
  const transactions = await (
    await fetch('https://quote-api.jup.ag/v1/swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // route from /quote api
        route: routes[0],
        // user public key to be used for the swap
        userPublicKey: wallet.publicKey.toString(),
        // auto wrap and unwrap SOL. default is true
        wrapUnwrapSOL: true,
        // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
        // This is the ATA account for the output token where the fee will be sent to. If you are swapping from SOL->USDC then this would be the USDC ATA you want to collect the fee.
        //feeAccount: "xxxx"  
      })
    })
  ).json()

  const { setupTransaction, swapTransaction, cleanupTransaction } = transactions
  
  try {
    // Execute the transactions
    for (let serializedTransaction of [setupTransaction, swapTransaction, cleanupTransaction].filter(Boolean)) {
      // get transaction object from serialized transaction
      const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'))
      // perform the swap
      const txid = await connection.sendTransaction(transaction, [wallet], {
        skipPreflight: true
      })
      await connection.confirmTransaction(txid)
      console.log(`https://solscan.io/tx/${txid}`)
    }
  } catch (error) {
    console.log(error);
  }
  
}

export default function App() {
  const [mintFrom, onChangeMintFrom] = useState("Mint from");
  const [mintTo, onChangeMintTo] = useState("Mint to");
  const [amount, onChangeAmount] = useState("Amount in lamports");
  const [slippage, setSlippage] = useState("0.5");

  // Variables colores 
  const [Cambio, setCambio ] = useState(false);
  const [Cambio1, setCambio1 ] = useState(false);
  const [Cambio2, setCambio2 ] = useState(false);

  function changeSlippage(value: string) {
    setSlippage(value)
    if(value === "0.1"){
      setCambio(true)
      setCambio1(false)
      setCambio2(false)
    }else if (value === "0.5"){
      setCambio1(true)
      setCambio(false)
      setCambio2(false)
    }else if (value === "1.0"){
      setCambio2(true)
      setCambio(false)
      setCambio1(false)
    }

  }

  async function obtenerCuentasAsociadas(){
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    let response = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: TOKEN_PROGRAM_ID });

    response.value.forEach((accountInfo) => {
      if (accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"] != 0) {
        console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`)
        console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
        console.log(`owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`);
        console.log(`decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`);
        console.log(`amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`);
        console.log("====================")
      }
    });
}

obtenerCuentasAsociadas()

  return (
    <View style={styles.body}>
      <Text style={styles.titulo}>Vortex Swap</Text>
      <Text style={styles.info}>This swap is an using Jupiter Aggregator</Text>
      <Text style={styles.info}>Public Key: {wallet.publicKey.toString()}</Text>
      <View style={styles.container}>
        <View style={styles.containerSlippage}>
          <Text style={{fontWeight: "bold"}}>Slippage:</Text>
          <TouchableOpacity
          style={[styles.buttonSlippage,{ backgroundColor:Cambio?"black" : "gray" }]} 
          onPress={() => changeSlippage("0.1")}
          >
            <Text style={{color: 'white', textAlign: 'center'}}>0.1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonSlippage,{ backgroundColor:Cambio1?"black" : "gray" }]} 
            onPress={() => changeSlippage("0.5")}
          >
            <Text style={{color: 'white', textAlign: 'center'}}>0.5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonSlippage,{ backgroundColor:Cambio2?"black" : "gray" }]} 
            onPress={() => changeSlippage("1.0")}
          >
            <Text style={{color: 'white', textAlign: 'center'}}>1.0</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          onChangeText={onChangeMintFrom}
          placeholder={mintFrom}
          />
        <TextInput
          style={styles.input}
          onChangeText={onChangeMintTo}
          placeholder={mintTo}
          />
        <TextInput
          style={styles.input}
          onChangeText={onChangeAmount}
          placeholder={amount}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => getRoutes(mintFrom,mintTo,amount,slippage)}
        >
          <Text style={{color: 'white', textAlign: 'center', fontWeight: "bold"}}>Swap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  info: {
    fontSize: 15,
    fontWeight: "200",
    marginBottom: 10
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    maxHeight: 400,
    borderWidth: 2,
    borderRadius: 15
  },
  containerSlippage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginBottom: 10
  },
  input: {
    height: 40,
    width: '90%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    width: '90%',
    height: 40,
    justifyContent: 'center',
    backgroundColor: 'black',
    borderRadius: 5,
    marginTop: 10
  },
  buttonSlippage: {
    width: '20%',
    height: 30,
    marginLeft: 20,
    justifyContent: 'center',
    borderRadius: 5
  }
});
