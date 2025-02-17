import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebaseConfig';
import { format } from 'date-fns';
import { uk, ru } from 'date-fns/locale';

const GBChatWindow = ({ route }) => {
  // Якщо chatIds передається, він містить масив ідентифікаторів чатів (гілок)
  const { chatId, chatIds } = route.params;
  const [messages, setMessages] = useState([]);
  const [userLanguage, setUserLanguage] = useState('uk'); // За замовчуванням українська
  const [guildId, setGuildId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let unsubscribes = [];
    const fetchMessages = async () => {
      const storedGuildId = await AsyncStorage.getItem('guildId');
      const storedUserId = await AsyncStorage.getItem('userId');
      setGuildId(storedGuildId);
      setUserId(storedUserId);

      // Завантаження налаштувань мови користувача
      const languageRef = ref(database, `users/${storedUserId}/setting/language`);
      const unsubscribeLang = onValue(languageRef, (snapshot) => {
        const language = snapshot.val();
        if (language) {
          setUserLanguage(language);
        }
      });
      unsubscribes.push(unsubscribeLang);

      // Об’єкт для зберігання повідомлень з кожної гілки
      let messageLists = {};

      // Функція обробки даних з Firebase для окремої гілки
      const processSnapshot = async (snapshot, branchId) => {
        const data = snapshot.val();
        let branchMessages = [];
        if (data) {
          branchMessages = await Promise.all(
            Object.entries(data).map(async ([messageId, item]) => {
              let userName = '';
              let imageUrl = '';
              let buildingName = '';
              let buildingLevel = '';
              let buildingImage = '';

              if (item.senderId !== storedUserId) {
                try {
                  const userData = await fetchUserData(storedGuildId, item.senderId);
                  userName = userData.userName;
                  imageUrl = userData.imageUrl;
                } catch (error) {
                  console.error('Помилка отримання даних користувача:', error);
                }
              }

              if (item.build) {
                const buildingData = await fetchBuildingData(item.build);
                buildingName = buildingData.name || 'Невідома ВС';
                buildingLevel = await fetchBuildingLevel(storedGuildId, item.senderId, item.build);
                buildingImage = buildingData.buildingImage || '';
              }

              const message = {
                id: messageId,
                ...item,
                isOwnMessage: String(item.senderId) === String(storedUserId),
                userName: userName || 'Невідомий',
                imageUrl,
                buildingName,
                buildingLevel,
                buildingImage,
              };

              // Якщо для поточного користувача в гілці excludedUser значення false, не повертаємо це повідомлення
              if (message.excludedUser && message.excludedUser[storedUserId] === false) {
                return null;
              }
              return message;
            })
          );
          branchMessages = branchMessages.filter((msg) => msg !== null);
        }
        messageLists[branchId] = branchMessages;
        // Об’єднання повідомлень з усіх гілок
        let combined = [];
        Object.values(messageLists).forEach((msgs) => {
          combined = combined.concat(msgs);
        });
        // Сортування повідомлень за timestamp
        combined.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(combined);
      };

      // Якщо chatIds передано – агрегуємо повідомлення з усіх зазначених гілок
      if (chatIds && Array.isArray(chatIds) && chatIds.length > 0) {
        chatIds.forEach((branchId) => {
          const messagesRef = ref(database, `guilds/${storedGuildId}/GBChat/${branchId}/messages`);
          const unsubscribe = onValue(
            messagesRef,
            (snapshot) => {
              processSnapshot(snapshot, branchId);
            },
            (error) => {
              console.error('Помилка отримання повідомлень:', error);
            }
          );
          unsubscribes.push(unsubscribe);
        });
      } else {
        // Якщо chatIds не передано, працюємо з однією гілкою (chatId)
        const messagesRef = ref(database, `guilds/${storedGuildId}/GBChat/${chatId}/messages`);
        const unsubscribe = onValue(
          messagesRef,
          async (snapshot) => {
            const data = snapshot.val();
            if (data) {
              let messageList = await Promise.all(
                Object.entries(data).map(async ([messageId, item]) => {
                  let userName = '';
                  let imageUrl = '';
                  let buildingName = '';
                  let buildingLevel = '';
                  let buildingImage = '';

                  if (item.senderId !== storedUserId) {
                    try {
                      const userData = await fetchUserData(storedGuildId, item.senderId);
                      userName = userData.userName;
                      imageUrl = userData.imageUrl;
                    } catch (error) {
                      console.error('Помилка отримання даних користувача:', error);
                    }
                  }

                  if (item.build) {
                    const buildingData = await fetchBuildingData(item.build);
                    buildingName = buildingData.name || 'Невідома ВС';
                    buildingLevel = await fetchBuildingLevel(storedGuildId, item.senderId, item.build);
                    buildingImage = buildingData.buildingImage || '';
                  }

                  const message = {
                    id: messageId,
                    ...item,
                    isOwnMessage: String(item.senderId) === String(storedUserId),
                    userName: userName || 'Невідомий',
                    imageUrl,
                    buildingName,
                    buildingLevel,
                    buildingImage,
                  };

                  if (message.excludedUser && message.excludedUser[storedUserId] === false) {
                    return null;
                  }
                  return message;
                })
              );
              messageList = messageList.filter((msg) => msg !== null);
              setMessages(messageList);
            } else {
              setMessages([]);
            }
          },
          (error) => {
            console.error('Помилка отримання повідомлень:', error);
          }
        );
        unsubscribes.push(unsubscribe);
      }
    };

    fetchMessages();

    // Очищення – відписка від усіх підписок при розмонтуванні компонента
    return () => {
      unsubscribes.forEach((unsub) => unsub && unsub());
    };
  }, [chatId, chatIds]);

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
          console.error('Помилка отримання даних користувача:', error);
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
          console.error('Помилка отримання даних про ВС:', error);
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
          console.error('Помилка отримання рівня ВС:', error);
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

  // Обробка натискання на кнопку вибору місця (лише для чужих повідомлень)
  const handlePlacePress = async (messageId, placeKey) => {
    if (!guildId || !userId) return;
    try {
      // Оновлюємо значення обраного місця на false
      const placeRef = ref(database, `guilds/${guildId}/GBChat/${chatId}/messages/${messageId}/places/${placeKey}`);
      await set(placeRef, false);
      // Створюємо (або оновлюємо) гілку excludedUser з ключем userId та значенням false
      const excludedUserRef = ref(database, `guilds/${guildId}/GBChat/${chatId}/messages/${messageId}/excludedUser/${userId}`);
      await set(excludedUserRef, false);
      Alert.alert('Місце вибрано', `Ви вибрали місце ${placeKey}`);
    } catch (error) {
      console.error('Помилка оновлення місця або excludedUser:', error);
    }
  };

  // Рендер кнопок для вибору місця
  const renderPlacesButtons = (places, messageId, isOwnMessage) => {
    if (!places) return null;

    return (
      <View style={styles.placesRow}>
        {Object.keys(places)
          .filter((key) => places[key])
          .map((key) => (
            <View key={key} style={styles.telegramButtonWrapper}>
              <Text
                style={styles.telegramButton}
                onPress={() => {
                  if (!isOwnMessage) {
                    handlePlacePress(messageId, key);
                  }
                }}
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
          <View style={styles.leftTextContainer}>
            <Text style={styles.userName}>
              {!item.isOwnMessage
                ? `${item.userName}: ${formatTimestamp(item.timestamp)}`
                : formatTimestamp(item.timestamp)}
            </Text>
            <Text style={styles.messageText}>
              {item.buildingName || 'Невідома ВС'} (Рівень: {Number(item.buildingLevel) + 1})
            </Text>
          </View>
          {item.build && item.buildingImage && (
            <Image
              source={{ uri: item.buildingImage }}
              style={styles.buildingImage}
              resizeMode="contain"
            />
          )}
        </View>
        <View style={styles.placesContainer}>
          {renderPlacesButtons(item.places, item.id, item.isOwnMessage)}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
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
