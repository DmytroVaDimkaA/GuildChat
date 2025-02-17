import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingActionButton from '../CustomElements/FloatingActionButton';
import { useNavigation } from '@react-navigation/native';
import { database } from '../../firebaseConfig';

const staticChatData = [
  { id: '1', name: 'Мої Величні Споруди' },
  { id: '2', name: 'Експрес прокачка' },
  { id: 'separator', type: 'separator' }, // Сепаратор для візуального розділення
];

const GBChatList = () => {
  const [chats, setChats] = useState(staticChatData);
  const navigation = useNavigation();

  useEffect(() => {
    let unsubscribe; // Функція для відписки від Firebase
    const fetchChats = async () => {
      try {
        // Отримуємо guildId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId');

        if (guildId) {
          // Створюємо референцію до чату в Firebase
          const chatRef = ref(database, `guilds/${guildId}/GBChat`);

          // Підписка на зміни даних у Firebase
          unsubscribe = onValue(chatRef, (snapshot) => {
            if (snapshot.exists()) {
              const chatData = snapshot.val();

              // Групування чатів за contributionMultiplier
              const groups = {};
              Object.keys(chatData).forEach((key) => {
                const multiplier = chatData[key].rules.contributionMultiplier;
                
                // Якщо групи з даним multiplier ще не існує — створюємо її
                if (!groups[multiplier]) {
                  groups[multiplier] = {
                    id: `group_${multiplier}`, // Унікальний id для групи
                    name: "Прокачка під " + multiplier,
                    chatIds: [key], // Зберігаємо ідентифікатори чатів, що входять до групи
                  };
                } else {
                  // Якщо група існує — додаємо поточний чат
                  groups[multiplier].chatIds.push(key);
                }
              });

              // Перетворюємо об’єкт груп у масив
              const firebaseChats = Object.values(groups);

              // Об’єднуємо статичні дані з групованими даними з Firebase
              setChats((prevChats) => {
                const merged = [...staticChatData, ...firebaseChats];
                // Фільтрація для уникнення дублювання за id
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

    // Відписка при розмонтуванні компонента
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Обробка натискання на FloatingActionButton
  const handleFabPress = () => {
    navigation.navigate('NewGBChat');
  };

  // Обробка вибору конкретного чату/групи
  const handleChatSelect = (chat) => {
    if (chat.id === '1') {
      navigation.navigate('MyGB');
    } else if (chat.id !== 'separator') {
      // При передачі параметрів можна передати як id групи, так і список chatIds
      navigation.navigate('GBChatWindow', { chatId: chat.id, chatIds: chat.chatIds || [] });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item }) =>
          item.type === 'separator' ? (
            <View style={styles.separator} />
          ) : (
            <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item)}>
              <Text style={styles.chatName}>{item.name}</Text>
            </TouchableOpacity>
          )
        }
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних чатів</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <FloatingActionButton onPress={handleFabPress} iconName="pencil" />
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
  separator: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 15,
  },
  emptyMessage: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});

export default GBChatList;
