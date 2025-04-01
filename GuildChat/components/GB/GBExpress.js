import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { getDatabase, ref, onValue, get, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';

const GBExpress = () => {
  const [groupedChats, setGroupedChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildingImages, setBuildingImages] = useState({});
  const [buildingNames, setBuildingNames] = useState({});
  const [userNames, setUserNames] = useState({});
  const [userLanguage, setUserLanguage] = useState(null); // Наприклад, "ua" або "en"
  const [guildId, setGuildId] = useState(null);
  // Поточний користувач для інших перевірок (напр., де кнопка "Взяти участь" деактивується)
  const [currentUserId, setCurrentUserId] = useState(null);
  // Стан для збереження рівнів ВС користувача для кожного buildID
  const [userBuildLevels, setUserBuildLevels] = useState({});

  // Стан модального вікна
  const [modalVisible, setModalVisible] = useState(false);
  // Стан групи чатів, для якої відкрили модальне вікно
  const [modalGroup, setModalGroup] = useState(null);

  // Використовуємо useRef для кешування отриманих даних
  const buildingImagesRef = useRef({});
  const buildingNamesRef = useRef({});
  const userNamesRef = useRef({});
  const userBuildLevelsRef = useRef({});

  const navigation = useNavigation();

  // Вивід усіх значень з AsyncStorage у форматі "ключ - значення"
  useEffect(() => {
    const logAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);
        stores.forEach(([key, value]) => {
          console.log(`${key} - ${value}`);
        });
      } catch (error) {
        // Обробка помилки при потребі
      }
    };
    logAsyncStorage();
  }, []);

  // Отримуємо userLanguage з AsyncStorage за ключем "userLanguage" (fallback "ua")
  useEffect(() => {
    const fetchUserLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('userLanguage');
        setUserLanguage(storedLanguage || 'ua');
      } catch (error) {
        setUserLanguage('ua');
      }
    };
    fetchUserLanguage();
  }, []);

  // Отримуємо guildId та currentUserId з AsyncStorage (для перевірки кнопки)
  useEffect(() => {
    const fetchGuildAndUser = async () => {
      try {
        const storedGuildId = await AsyncStorage.getItem('guildId');
        const storedUserId = await AsyncStorage.getItem('userId');
        setGuildId(storedGuildId);
        setCurrentUserId(storedUserId);
      } catch (error) {
        // Обробка помилки
      }
    };
    fetchGuildAndUser();
  }, []);

  // Завантаження чатів, даних для ВС, користувачів та рівнів ВС
  useEffect(() => {
    if (!userLanguage || !guildId || !currentUserId) return;

    const fetchChats = async () => {
      try {
        const db = getDatabase();
        const chatsRef = ref(db, `guilds/${guildId}/express`);

        onValue(chatsRef, (snapshot) => {
          if (snapshot.exists()) {
            // Отримуємо дані з id чату
            const chatEntries = Object.entries(snapshot.val()).map(([key, value]) => ({ id: key, ...value }));
            const currentTime = Date.now();

            // Фільтруємо чати за актуальною датою
            const filteredChats = chatEntries.filter(
              (chat) => chat.scheduleTime && chat.scheduleTime > currentTime
            );

            // Групуємо чати за scheduleTime
            const grouped = filteredChats.reduce((acc, chat) => {
              const timeKey = chat.scheduleTime;
              if (!acc[timeKey]) {
                acc[timeKey] = { scheduleTime: timeKey, chats: [] };
              }
              acc[timeKey].chats.push(chat);
              return acc;
            }, {});
            const groupedList = Object.values(grouped).sort((a, b) => a.scheduleTime - b.scheduleTime);
            setGroupedChats(groupedList);

            // Створюємо mapping: для кожного buildID (allowedGB) знаходимо перший чат та його автора
            const buildUserMapping = {};
            filteredChats.forEach((chat) => {
              if (chat.allowedGB && !buildUserMapping[chat.allowedGB]) {
                buildUserMapping[chat.allowedGB] = chat.user;
              }
            });

            // Отримуємо унікальні buildID для ВС
            const uniqueBuildIDs = new Set();
            filteredChats.forEach((chat) => {
              if (chat.allowedGB) uniqueBuildIDs.add(chat.allowedGB);
            });

            // Завантажуємо дані про ВС (зображення та назва)
            uniqueBuildIDs.forEach((buildID) => {
              if (!buildingImagesRef.current.hasOwnProperty(buildID)) {
                get(ref(db, `greatBuildings/${buildID}`))
                  .then((snap) => {
                    if (snap.exists()) {
                      const buildingData = snap.val();
                      const { buildingImage, buildingName } = buildingData;

                      if (typeof buildingImage === 'string') {
                        buildingImagesRef.current[buildID] = buildingImage;
                      } else if (buildingImage && typeof buildingImage === 'object' && buildingImage.uri) {
                        buildingImagesRef.current[buildID] = buildingImage.uri;
                      } else {
                        buildingImagesRef.current[buildID] = null;
                      }
                      setBuildingImages({ ...buildingImagesRef.current });

                      if (buildingName && typeof buildingName === 'object') {
                        buildingNamesRef.current[buildID] = buildingName[userLanguage];
                      } else {
                        buildingNamesRef.current[buildID] = buildingName || null;
                      }
                      setBuildingNames({ ...buildingNamesRef.current });
                    } else {
                      buildingImagesRef.current[buildID] = null;
                      buildingNamesRef.current[buildID] = null;
                      setBuildingImages({ ...buildingImagesRef.current });
                      setBuildingNames({ ...buildingNamesRef.current });
                    }
                  })
                  .catch((error) => {
                    // Обробка помилки
                  });
              }
            });

            // Завантажуємо рівні ВС для користувача, який створив чат (з ключем user з чату)
            uniqueBuildIDs.forEach((buildID) => {
              if (!userBuildLevelsRef.current.hasOwnProperty(buildID)) {
                const chatUserId = buildUserMapping[buildID]; // користувач, взятий з чату
                get(ref(db, `guilds/${guildId}/guildUsers/${chatUserId}/greatBuild/${buildID}`))
                  .then((snap) => {
                    if (snap.exists()) {
                      const buildData = snap.val();
                      // Очікуємо, що рівень зберігається у ключі level
                      userBuildLevelsRef.current[buildID] = buildData.level;
                    } else {
                      userBuildLevelsRef.current[buildID] = 0;
                    }
                    setUserBuildLevels({ ...userBuildLevelsRef.current });
                  })
                  .catch((error) => {
                    userBuildLevelsRef.current[buildID] = 0;
                    setUserBuildLevels({ ...userBuildLevelsRef.current });
                  });
              }
            });

            // Завантажуємо дані користувачів
            const uniqueUserIDs = new Set();
            filteredChats.forEach((chat) => {
              if (chat.user) uniqueUserIDs.add(chat.user);
            });
            uniqueUserIDs.forEach((userId) => {
              if (!userNamesRef.current.hasOwnProperty(userId)) {
                get(ref(db, `users/${userId}`))
                  .then((snap) => {
                    if (snap.exists()) {
                      const userData = snap.val();
                      userNamesRef.current[userId] = userData.userName;
                      setUserNames({ ...userNamesRef.current });
                    } else {
                      userNamesRef.current[userId] = null;
                      setUserNames({ ...userNamesRef.current });
                    }
                  })
                  .catch((error) => {
                    // Обробка помилки
                  });
              }
            });
          } else {
            setGroupedChats([]);
          }
          setLoading(false);
        });
      } catch (error) {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userLanguage, guildId, currentUserId]);

  // Обробка натискання кнопки "Взяти участь" – відкриваємо модальне вікно для відповідної групи чатів
  const handleJoinPress = (group) => {
    setModalGroup(group);
    setModalVisible(true);
  };

  // Функція, що викликається при натисканні "Прийняти" у модальному вікні
  const handleAccept = async () => {
    if (!guildId || !modalGroup) return;
    const db = getDatabase();

    // Для кожного чату в групі додаємо запис у allowedUsers
    for (const chat of modalGroup.chats) {
      await set(ref(db, `guilds/${guildId}/express/${chat.id}/allowedUsers/${chat.user}`), true);
    }
    setModalVisible(false);
  };

  // Функція закриття модального вікна
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Функція переходу до GBNewExpress
  const handleAddExpress = (scheduleTime) => {
    navigation.navigate('GBNewExpress', { scheduleTime });
  };

  return (
    <View style={styles.container}>
      {/* Модальне вікно */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Ваша ставка успішно прийнята! Якщо ваша Арка увійде до п’ятірки, що задовольняють умови експресу, ви отримаєте нагадування за 5 хвилин до його початку.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={handleCancel}>
                <Text style={styles.modalButtonText}>Відміна</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.acceptButton]} onPress={handleAccept}>
                <Text style={styles.modalButtonText}>Прийняти</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#0088cc" />
      ) : groupedChats.length === 0 ? (
        <Text style={styles.emptyText}>Немає доступних чатів</Text>
      ) : (
        <FlatList
          data={groupedChats}
          keyExtractor={(item) => item.scheduleTime.toString()}
          renderItem={({ item }) => {
            const scheduleDate = new Date(item.scheduleTime);
            const today = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);

            const timeString = scheduleDate.toLocaleTimeString('uk-UA', {
              hour: 'numeric',
              minute: 'numeric',
            });

            let formattedDate = '';
            if (
              scheduleDate.getFullYear() === today.getFullYear() &&
              scheduleDate.getMonth() === today.getMonth() &&
              scheduleDate.getDate() === today.getDate()
            ) {
              formattedDate = `сьогодні, ${timeString}`;
            } else if (
              scheduleDate.getFullYear() === tomorrow.getFullYear() &&
              scheduleDate.getMonth() === tomorrow.getMonth() &&
              scheduleDate.getDate() === tomorrow.getDate()
            ) {
              formattedDate = `завтра, ${timeString}`;
            } else {
              formattedDate = scheduleDate.toLocaleString('uk-UA', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
              });
            }

            // Якщо всі чати групи створені поточним користувачем, кнопка "Взяти участь" неактивна
            const isOwnGroup = item.chats.every((chat) => chat.user === currentUserId);

            // Кількість записів з гілки allowedUsers для першого чату групи
            let badgeCount = 0;
            if (
              item.chats &&
              item.chats.length > 0 &&
              item.chats[0].allowedUsers &&
              typeof item.chats[0].allowedUsers === 'object'
            ) {
              badgeCount = Object.keys(item.chats[0].allowedUsers).length;
            }

            return (
              <View style={styles.groupContainer}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTime}>Запланований час: {formattedDate}</Text>
                  <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faUserGroup} size={20} style={styles.groupIcon} />
                    {badgeCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badgeCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {item.chats.map((chat, index) => (
                  <View key={index} style={styles.chatItem}>
                    <View style={styles.chatRow}>
                      {buildingImages[chat.allowedGB] ? (
                        <Image
                          source={{ uri: buildingImages[chat.allowedGB] }}
                          style={styles.chatImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.chatImagePlaceholder} />
                      )}
                      <View style={styles.chatTextContainer}>
                        <Text style={styles.chatTitle}>
                          {userNames[chat.user]} ({buildingNames[chat.allowedGB]})
                        </Text>
                        <Text style={styles.chatDescription}>
                          Орієнтовно <Text style={styles.boldText}>{chat.levelThreshold}</Text> рівнів (
                          <Text style={styles.boldText}>
                            {userBuildLevels[chat.allowedGB] !== undefined ? userBuildLevels[chat.allowedGB] + 1 : 1}
                          </Text>{' '}
                          →{' '}
                          <Text style={styles.boldText}>
                            {userBuildLevels[chat.allowedGB] !== undefined
                              ? userBuildLevels[chat.allowedGB] + chat.levelThreshold
                              : chat.levelThreshold}
                          </Text>
                          )
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, isOwnGroup && styles.disabledButton]}
                    onPress={() => !isOwnGroup && handleJoinPress(item)}
                    disabled={isOwnGroup}
                  >
                    <Text style={styles.buttonText}>Взяти участь</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleAddExpress(item.scheduleTime)}>
                    <Text style={styles.buttonText}>Додати свій експрес</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  groupContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  groupTime: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    position: 'relative',
  },
  groupIcon: {
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#0088cc',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  chatItem: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  chatImagePlaceholder: {
    width: 50,
    height: 50,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  chatTextContainer: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatDescription: {
    fontSize: 14,
    color: '#666',
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0088cc',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  acceptButton: {
    backgroundColor: '#0088cc',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GBExpress;
