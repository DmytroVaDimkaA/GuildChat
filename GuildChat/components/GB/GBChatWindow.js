import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig'; // Імпорт Firebase конфігурації
import { format } from 'date-fns';
import { uk, ru } from 'date-fns/locale';

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

      onValue(
        messagesRef,
        async (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const messageList = await Promise.all(
              Object.values(data).map(async (item) => {
                let userName = '';
                let imageUrl = '';
                let buildingName = '';
                let buildingLevel = ''; // Рівень ВС
                let buildingImage = ''; // Шлях до зображення ВС

                if (item.senderId !== userId) {
                  try {
                    const userData = await fetchUserData(guildId, item.senderId);
                    userName = userData.userName;
                    imageUrl = userData.imageUrl;
                  } catch (error) {
                    console.error('Error fetching user data:', error);
                  }
                }

                if (item.build) {
                  const buildingData = await fetchBuildingData(item.build); // item.build - це buildingId
                  buildingName = buildingData.name || 'Невідома ВС';
                  buildingLevel = await fetchBuildingLevel(guildId, item.senderId, item.build); // Отримуємо рівень ВС
                  buildingImage = buildingData.buildingImage || '';
                }

                return {
                  ...item,
                  isOwnMessage: String(item.senderId) === String(userId),
                  userName: userName || 'Невідомий',
                  imageUrl,
                  buildingName,
                  buildingLevel,
                  buildingImage,
                };
              })
            );
            setMessages(messageList);
          } else {
            setMessages([]); // Якщо дані не знайдені, очищаємо список повідомлень
          }
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );
    };

    fetchMessages();
  }, [chatId]);

  const fetchUserData = async (guildId, senderId) => {
    const userRef = ref(database, `guilds/${guildId}/guildUsers/${senderId}`);
    return new Promise((resolve, reject) => {
      onValue(
        userRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            resolve({
              userName: data.userName || 'Невідомий',
              imageUrl: data.imageUrl || '',
            });
          } else {
            resolve({ userName: 'Невідомий', imageUrl: '' });
          }
        },
        (error) => {
          console.error('Error fetching user data:', error);
          reject(error);
        }
      );
    });
  };

  const fetchBuildingData = async (buildingId) => {
    const buildingRef = ref(database, `greatBuildings/${buildingId}`);
    return new Promise((resolve, reject) => {
      onValue(
        buildingRef,
        (snapshot) => {
          const buildingData = snapshot.val();
          if (buildingData) {
            resolve({
              name: buildingData.buildingName || 'Невідома ВС',
              level: buildingData.level || 'Невідомий рівень',
              buildingImage: buildingData.buildingImage || '',
            });
          } else {
            resolve({ name: 'Невідома ВС', level: 'Невідомий рівень', buildingImage: '' });
          }
        },
        (error) => {
          console.error('Error fetching building data:', error);
          reject(error);
        }
      );
    });
  };

  const fetchBuildingLevel = async (guildId, senderId, buildId) => {
    const buildingRef = ref(
      database,
      `guilds/${guildId}/guildUsers/${senderId}/greatBuild/${buildId}/level`
    );
    return new Promise((resolve, reject) => {
      onValue(
        buildingRef,
        (snapshot) => {
          const level = snapshot.val();
          resolve(level || 'Невідомий рівень');
        },
        (error) => {
          console.error('Error fetching building level:', error);
          reject(error);
        }
      );
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const localeMap = {
      uk: uk,
      ru: ru,
    };

    const locale = localeMap[userLanguage] || localeMap['uk'];

    if (date.toDateString() === now.toDateString()) {
      return `Сьогодні о ${format(date, 'HH:mm', { locale })}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Вчора о ${format(date, 'HH:mm', { locale })}`;
    }

    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    if (date >= startOfWeek) {
      return `${format(date, 'EEEE', { locale })} о ${format(date, 'HH:mm', { locale })}`;
    }

    return format(date, 'd MMMM о HH:mm', { locale });
  };

  const renderPlacesButtons = (places) => {
    if (!places) return null;

    return (
      <View style={styles.placesRow}>
        {Object.keys(places)
          .filter((key) => places[key])
          .map((key) => (
            <View key={key} style={styles.telegramButtonWrapper}>
              <Text
                style={styles.telegramButton}
                onPress={() => Alert.alert('Місце вибрано', `Ви вибрали місце ${key}`)}
              >
                {key}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageWrapper}>
      {!item.isOwnMessage && item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
      )}
      <View style={[styles.messageItem, item.isOwnMessage ? styles.ownMessage : styles.otherMessage]}>
        <View style={styles.headerContainer}>
          {/* Лівий блок з двома рядками: час повідомлення та назва з рівнем ВС */}
          <View style={styles.leftTextContainer}>
            <Text style={styles.userName}>
              {!item.isOwnMessage
                ? `${item.userName}: ${formatTimestamp(item.timestamp)}`
                : formatTimestamp(item.timestamp)}
            </Text>
            <Text style={styles.messageText}>
              {item.buildingName || 'Невідома ВС'} (Рівень: {item.buildingLevel + 1})
            </Text>
          </View>
          {/* Праворуч розташоване зображення ВС, яке не обрізається */}
          {item.build && item.buildingImage && (
            <Image
              source={{ uri: item.buildingImage }}
              style={styles.buildingImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.placesContainer}>
          {renderPlacesButtons(item.places)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()} // За потреби використовуйте унікальний ключ (item.id)
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
    backgroundColor: '#d1e7dd',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
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
  // Контейнер для лівого блоку з текстом та правого зображення
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  // Лівий блок з текстом (два рядки)
  leftTextContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  messageText: {
    fontSize: 14,
  },
  buildingImage: {
    width: 50,
    height: 50,
    marginLeft: 10,
  },
  placesContainer: {
    marginTop: 10,
  },
  placesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  telegramButtonWrapper: {
    alignItems: 'center',
  },
  telegramButton: {
    backgroundColor: '#0088cc',
    color: 'white',
    paddingVertical: 6,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    width: 30,
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default GBChatWindow;
