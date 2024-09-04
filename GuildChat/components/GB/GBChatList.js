import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FloatingActionButton from '../CustomElements/FloatingActionButton';
import { useNavigation } from '@react-navigation/native';

const chatData = [
  { id: '1', name: 'Мої Величні Споруди' },
  // Додайте інші чати тут за потреби
];

const GBChatList = ({ chats }) => {
  const navigation = useNavigation();

  const handleFabPress = () => {
    navigation.navigate('NewGBChat'); // Перехід до NewGBChat
  };

  const handleChatSelect = (chat) => {
    if (chat.id === '1') {
      // Перехід на сторінку MyGB для чату з індексом 1
      navigation.navigate('MyGB');
    } else {
      // Перехід на ChatWindow для всіх інших чатів
      navigation.navigate('ChatWindow', { chatId: chat.id });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats || chatData} // Використання chatData, якщо chats не передано
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item)}>
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних чатів</Text>}
      />
      <FloatingActionButton 
        onPress={handleFabPress} 
        iconName="pencil" 
      />
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
});

export default GBChatList;
