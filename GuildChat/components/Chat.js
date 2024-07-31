import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Chat = () => {
  return (
    <View style={styles.win}>
      <Text style={styles.text}>Chat</Text>
     
      
    </View>
  );
};

const styles = StyleSheet.create({

  text: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  win: {
top: 100,

  },
});

export default Chat;