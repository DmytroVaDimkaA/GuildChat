import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const chatData = []; // Порожній список чатів

const ChatList = ({ onSelectChat }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={chatData}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => onSelectChat(item)}>
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних чатів</Text>} // Повідомлення про порожній список
      />
      <TouchableOpacity style={styles.fab} onPress={() => console.log('Додати новий чат')}>
        <Image
          source={{ uri: 'https://example.com/pencil-icon.png' }} // Заміни URI на фактичний шлях до іконки олівця
          style={styles.fabIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatName: {
    fontSize: 18,
  },
  emptyMessage: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});

export default ChatList;
