import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NewGBChat = () => {
  return (
    <View style={styles.container}>
      <View style={styles.block}><Text>Block 1</Text></View>
      <View style={styles.block}><Text>Block 2</Text></View>
      <View style={styles.block}><Text>Block 3</Text></View>
      <View style={styles.block}><Text>Block 4</Text></View>
      <View style={styles.block}><Text>Block 5</Text></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block: {
    width: '80%',
    height: 50,
    backgroundColor: '#ccc',
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewGBChat;
