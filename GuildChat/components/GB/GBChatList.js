import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingActionButton from '../CustomElements/FloatingActionButton';
import { useNavigation } from '@react-navigation/native';
import { database } from '../../firebaseConfig';

const staticChatData = [
  { id: '1', name: 'Мої Величні Споруди' },
];

const GBChatList = () => {
  const [chats, setChats] = useState(staticChatData);
  const navigation = useNavigation();

  useEffect(() => {
    let unsubscribe; // Функція для відписки від підписки на Firebase
    const fetchChats = async () => {
      try {
        // Отримання guildId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId');

        if (guildId) {
          // Створення референції до чату в Firebase
          const chatRef = ref(database, `guilds/${guildId}/GBChat`);

          // Підписка на дані з Firebase
          unsubscribe = onValue(chatRef, (snapshot) => {
            if (snapshot.exists()) {
              const chatData = snapshot.val();
              // Перетворення отриманих даних у масив чатів
              const firebaseChats = Object.keys(chatData).map((key) => ({
                id: key,
                // Формуємо назву чату як "Прокачка під " + contributionMultiplier,
                // де contributionMultiplier зберігається у полі rules.contributionMultiplier
                name: "Прокачка під " + chatData[key].rules.contributionMultiplier,
              }));

              // Об’єднання статичних даних із даними з Firebase та фільтрація для уникнення дублювання за id
              setChats((prevChats) => {
                const merged = [...prevChats, ...firebaseChats];
                const uniqueChats = merged.filter((chat, index, self) =>
                  index === self.findIndex((c) => c.id === chat.id)
                );
                return uniqueChats;
              });
            }
          });
        }
      } catch (error) {
        console.error('Помилка отримання чатів: ', error);
      }
    };

    fetchChats();

    // Функція очищення (відписка) при розмонтуванні компонента
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleFabPress = () => {
    navigation.navigate('NewGBChat'); // Перехід до екрана створення нового чату
  };

  const handleChatSelect = (chat) => {
    if (chat.id === '1') {
      navigation.navigate('MyGB'); // Якщо це статичний чат "Мої Величні Споруди"
    } else {
      navigation.navigate('GBChatWindow', { chatId: chat.id }); // Перехід до вікна чату з передачею chatId
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
    backgroundColor: 'white',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
