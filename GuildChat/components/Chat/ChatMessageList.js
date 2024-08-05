import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import MessageItem from './ChatMessageItem';

const ChatMessageList = ({ messages }) => {
  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => <MessageItem message={item} />}
      keyExtractor={(item, index) => index.toString()}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});

export default ChatMessageList;
