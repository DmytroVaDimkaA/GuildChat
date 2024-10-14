import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database'; // Firebase Database
import AsyncStorage from '@react-native-async-storage/async-storage'; // Правильний імпорт AsyncStorage
import FloatingActionButton from '../CustomElements/FloatingActionButton';
import { useNavigation } from '@react-navigation/native';
import { database } from '../../firebaseConfig'; // Імпорт вашого firebaseConfig

const staticChatData = [
  { id: '1', name: 'Мої Величні Споруди' },
];

const GBChatList = () => {
  const [chats, setChats] = useState(staticChatData); // Ініціалізація зі статичними даними
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Отримання guildId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId'); // Заміна методу

        if (guildId) {
          // Firebase референція до чату
          const chatRef = ref(database, `guilds/${guildId}/GBChat`);
          
          // Отримання даних про чати з Firebase
          onValue(chatRef, (snapshot) => {
            if (snapshot.exists()) {
              const chatData = snapshot.val();
              const firebaseChats = Object.keys(chatData).map((key) => ({
                id: key,
                name: chatData[key].chatName, // Припускаємо, що є поле chatName
              }));

              // Оновлення списку чатів з додаванням Firebase даних
              setChats((prevChats) => [...prevChats, ...firebaseChats]);
            }
          });
        }
      } catch (error) {
        console.error('Помилка отримання чатів: ', error);
      }
    };

    fetchChats();
  }, []);

  const handleFabPress = () => {
    navigation.navigate('NewGBChat'); // Перехід до NewGBChat
  };

  const handleChatSelect = (chat) => {
    if (chat.id === '1') {
      navigation.navigate('MyGB'); // Перехід на MyGB для чату з індексом 1
    } else {
      navigation.navigate('ChatWindow', { chatId: chat.id }); // Перехід до ChatWindow для інших чатів
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
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
    padding: 20,
    backgroundColor: 'white', // додаємо явний білий фон
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: '#ddd',
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
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
