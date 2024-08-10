import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FloatingActionButton from '../FloatingActionButton';

const chatData = []; // Порожній список чатів

const ChatList = ({ onSelectChat }) => {
  const handleFabPress = () => {
    console.log('Floating Action Button Pressed');
    // Додайте сюди логіку для відкриття нового чату або меню
  };
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
      <TouchableOpacity onPress={() => console.log('Додати новий чат')}>
      <FloatingActionButton onPress={handleFabPress} />
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
    backgroundColor: '#517da2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  icon: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
});

export default ChatList;
