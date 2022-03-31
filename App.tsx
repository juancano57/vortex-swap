import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function App() {
  const [mintFrom, onChangeMintFrom] = useState("Mint from");
  const [mintTo, onChangeMintTo] = useState("Mint to");
  const [amount, onChangeAmount] = useState("Amount");
  const [slippage, setSlippage] = useState("0.5");
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

  return (
    <View style={styles.container}>

      <View style={styles.containerSlippage}>
        <Text>Slippage:</Text>
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
        // OnPress
      >
        <Text style={{color: 'white', textAlign: 'center'}}>Swap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  containerSlippage: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
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
    borderRadius: 5
  },
  buttonSlippage: {
    width: '20%',
    height: 30,
    marginLeft: 20,
    justifyContent: 'center',
    borderRadius: 5
  }
});
