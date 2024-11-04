import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig'; // Імпорт Firebase конфігурації
import { format } from 'date-fns';
import { uk, ru } from 'date-fns/locale'; // Імпортуємо локалі з date-fns

const GBChatWindow = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [userLanguage, setUserLanguage] = useState('uk'); // За замовчуванням українська

  useEffect(() => {
    const fetchMessages = async () => {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId'); // Завантажуємо власний userId
      const messagesRef = ref(database, `guilds/${guildId}/GBChat/${chatId}/messages`);

      // Завантажуємо налаштування мови з Firebase
      const languageRef = ref(database, `users/${userId}/setting/language`);
      onValue(languageRef, (snapshot) => {
        const language = snapshot.val();
        if (language) {
          setUserLanguage(language);
        }
      });

      onValue(messagesRef, async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = await Promise.all(
            Object.values(data).map(async (item) => {
              let userName = '';
              let imageUrl = '';
              let buildingName = '';
              let buildingLevel = ''; // Додаємо змінну для рівня будівлі

              if (item.senderId !== userId) {
                const userData = await fetchUserData(guildId, item.senderId);
                userName = userData.userName;
                imageUrl = userData.imageUrl;
              }

              // Використовуємо item.build для отримання назви будівлі та рівня
              if (item.build) {
                const buildingData = await fetchBuildingData(item.build); // item.build - це buildingId
                buildingName = buildingData.name || 'Невідома будівля';
                buildingLevel = await fetchBuildingLevel(guildId, item.senderId, item.build); // Отримуємо рівень будівлі
              }

              return {
                ...item,
                isOwnMessage: String(item.senderId) === String(userId),
                userName: userName || 'Невідомий',
                imageUrl,
                buildingName,
                buildingLevel, // Додаємо рівень будівлі
              };
            })
          );
          setMessages(messageList);
        } else {
          setMessages([]); // Якщо дані не знайдені, очищаємо список повідомлень
        }
      }, (error) => {
        console.error('Error fetching messages:', error);
      });
    };

    fetchMessages();
  }, [chatId]);

  const fetchUserData = async (guildId, senderId) => {
    const userRef = ref(database, `guilds/${guildId}/guildUsers/${senderId}`);
    return new Promise((resolve, reject) => {
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          resolve({
            userName: data.userName || 'Невідомий',
            imageUrl: data.imageUrl || '',
          });
        } else {
          resolve({ userName: 'Невідомий', imageUrl: '' });
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
        resolve({ userName: 'Невідомий', imageUrl: '' });
      });
    });
  };

  const fetchBuildingData = async (buildingId) => {
    const buildingRef = ref(database, `greatBuildings/${buildingId}`);
    return new Promise((resolve, reject) => {
      onValue(buildingRef, (snapshot) => {
        const buildingData = snapshot.val();
        if (buildingData) {
          resolve({
            name: buildingData.buildingName || 'Невідома будівля',
            level: buildingData.level || 'Невідомий рівень', // Припускаємо, що рівень зберігається тут
          });
        } else {
          resolve({ name: 'Невідома будівля', level: 'Невідомий рівень' });
        }
      }, (error) => {
        console.error('Error fetching building data:', error);
        resolve({ name: 'Невідома будівля', level: 'Невідомий рівень' });
      });
    });
  };

  // Функція для отримання рівня Великої Будівлі
  const fetchBuildingLevel = async (guildId, senderId, buildId) => {
    const buildingRef = ref(database, `guilds/${guildId}/guildUsers/${senderId}/greatBuild/${buildId}/level`);
    return new Promise((resolve, reject) => {
      onValue(buildingRef, (snapshot) => {
        const level = snapshot.val();
        resolve(level || 'Невідомий рівень');
      }, (error) => {
        console.error('Error fetching building level:', error);
        resolve('Невідомий рівень');
      });
    });
  };

  // Функція для форматування часу
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    // Вибираємо локаль залежно від мови користувача
    const localeMap = {
      uk: uk,
      ru: ru,
    };

    const locale = localeMap[userLanguage] || localeMap['uk']; // Якщо немає відповідної мови, використовуємо українську

    // Якщо сьогодні
    if (date.toDateString() === now.toDateString()) {
      return `Сьогодні о ${format(date, 'HH:mm', { locale })}`;
    }

    // Якщо вчора
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Вчора о ${format(date, 'HH:mm', { locale })}`;
    }

    // Якщо дата в межах поточного тижня
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    if (date >= startOfWeek) {
      return `${format(date, 'EEEE', { locale })} о ${format(date, 'HH:mm', { locale })}`; // Локалізований день тижня
    }

    // Для давніших дат
    return format(date, 'd MMMM о HH:mm', { locale }); // Локалізована дата і місяць
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageWrapper}>
      {!item.isOwnMessage && item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.avatar} /> // Аватар поза повідомленням
      )}
      <View style={[styles.messageItem, item.isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        {/* Виводимо логін, рівень і дату разом у одному рядку */}
        <Text style={styles.userName}>
          {!item.isOwnMessage 
            ? `${item.userName}: ${formatTimestamp(item.timestamp)}`
            : `${formatTimestamp(item.timestamp)}`}
        </Text>
        <Text style={styles.messageText}>{item.buildingName || 'Пусте повідомлення'} (Рівень: {item.buildingLevel+1})</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає повідомлень</Text>}
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
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  messageItem: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  ownMessage: {
    marginLeft: 20,
    backgroundColor: '#d1e7dd', // Колір фону для власних повідомлень
    alignSelf: 'flex-end', // Вирівнюємо по правому краю
  },
  otherMessage: {
    marginLeft: 10, // Відступ зліва для чужих повідомлень
    marginRight: 20,
    backgroundColor: '#f0f0f0', // Колір фону для чужих повідомлень
    alignSelf: 'flex-start', // Вирівнюємо по лівому краю
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  messageText: {
    marginTop: 5,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'gray',
  },
});

export default GBChatWindow;
