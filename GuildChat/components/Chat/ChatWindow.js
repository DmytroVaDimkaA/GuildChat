import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal, ScrollView,
  Button,
  Alert
} from "react-native";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
import { format } from 'date-fns';
import { uk, ru, es, fr, de } from 'date-fns/locale'; // Імпортуємо всі потрібні локалі
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import translateMessage from '../../translateMessage'; // Імпорт функції перекладу
import { database, storage } from '../../firebaseConfig'; // Імпортуйте Firebase
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid'; // Для генерації унікальних ID


const { width: screenWidth } = Dimensions.get('window');
// Об'єкт для керування локалями
const locales = {
  uk: uk,
  ru: ru,
  es: es,
  fr: fr,
  de: de,
  // Додайте інші локалі за потреби
};

const ChatWindow = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const maxInputHeight = 120;
  const { chatId, initialMessage, isGroupChat } = route.params || {};
  console.log('chatId:', chatId); // Додайте цей рядок

  const [userId, setUserId] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [contactAvatar, setContactAvatar] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [locale, setLocale] = useState(uk); // Локаль за замовчуванням
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    const fetchUserIdAndGuildId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedGuildId = await AsyncStorage.getItem("guildId");
        setUserId(storedUserId);
        setGuildId(storedGuildId);
      } catch (error) {
        console.error("Error fetching user or guild ID: ", error);
      }
    };

    fetchUserIdAndGuildId();
  }, []);

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const localeRef = ref(db, `users/${userId}/setting/language`);

      onValue(localeRef, (snapshot) => {
        const localeCode = snapshot.val();
        if (locales[localeCode]) {
          setLocale(locales[localeCode]); // Вибір відповідної локалі
        } else {
          setLocale(uk); // Локаль за замовчуванням
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    if (chatId && guildId) {
      const db = getDatabase();
      const chatRef = ref(db, `guilds/${guildId}/chats/${chatId}/name`);

      onValue(chatRef, (snapshot) => {
        const chatName = snapshot.val();
        if (chatName) {
          if (isGroupChat) {
            navigation.setOptions({ title: chatName });
          } else {
            const chatMembersRef = ref(db, `guilds/${guildId}/chats/${chatId}/members`);
            onValue(chatMembersRef, (snapshot) => {
              const members = snapshot.val() || {};
              const otherUserId = Object.keys(members).find(id => id !== userId);
              if (otherUserId) {
                const userRef = ref(db, `guilds/${guildId}/guildUsers/${otherUserId}`);
                onValue(userRef, (snapshot) => {
                  const userData = snapshot.val();
                  if (userData) {
                    setContactAvatar(userData.imageUrl);
                    setContactName(userData.userName);
                    navigation.setOptions({
                      headerTitle: () => (
                        <View style={styles.headerContent}>
                          {contactAvatar && (
                            <Image
                              source={{ uri: contactAvatar }}
                              style={styles.avatar}
                            />
                          )}
                          <Text style={styles.headerTitle}>{contactName}</Text>
                        </View>
                      ),
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  }, [chatId, guildId, isGroupChat, navigation, userId, contactAvatar, contactName]);

  useEffect(() => {
    const fetchMessages = () => {
      if (!chatId || !guildId) return;

      const db = getDatabase();
      const messagesRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);

      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val() || {};
        const messagesList = Object.keys(messagesData).map((key) => ({
          id: key,
          ...messagesData[key],
        }));

        const groupedMessages = messagesList.reduce((acc, message) => {
          const date = format(new Date(message.timestamp), 'd MMMM', { locale });
          if (!acc[date]) acc[date] = [];
          acc[date].push(message);
          return acc;
        }, {});

        const groupedMessagesArray = Object.keys(groupedMessages).map(date => ({
          date,
          messages: groupedMessages[date]
        }));

        setMessages(groupedMessagesArray);
      });
    };

    fetchMessages();
  }, [chatId, guildId, locale]);

  
  
  // Отримання guildId та chatId з AsyncStorage
const getChatData = async () => {
  try {
    //const guildId = await AsyncStorage.getItem('guildId'); // Замість 'guildId' використайте правильний ключ
    //const chatId = await AsyncStorage.getItem('chatId');   // Замість 'chatId' використайте правильний ключ
    console.log("guildId:", guildId);
    return { guildId, chatId };
  } catch (error) {
    console.error("Не вдалося отримати дані з AsyncStorage:", error);
  }
};

const uploadImageAndSaveMessage = async (messageText) => {
  try {
    // Перевірка наявності даних
    const guildId = await AsyncStorage.getItem('guildId');
    const userId = await AsyncStorage.getItem('userId');
    const { chatId } = route.params || {};

    if (!guildId || !chatId) {
      console.error('Не вдалося отримати guildId або chatId.', { guildId, chatId });
      Alert.alert('Помилка', 'Не вдалося отримати guildId або chatId.');
      return;
    }

    // Запит дозволу на доступ до медіа
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Увага", "Доступ до медіа-ресурсів не надано.");
      return;
    }

    // Вибір кількох зображень
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Дозволяє вибирати кілька зображень
      quality: 1, // Висока якість зображення
    });

    if (result.canceled) {
      Alert.alert("Увага", "Зображення не вибрано.");
      return;
    }

    const imageUris = result.assets.map(asset => asset.uri); // Отримання URI всіх вибраних зображень

    // Завантаження зображень до Firebase Storage
    const imageUrls = await Promise.all(imageUris.map(async (imageUri) => {
      const imageId = uuid.v4(); // Генерація унікального ID для кожного зображення
      const imageRef = storageRef(getStorage(), `images/${imageId}.jpeg`);

      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      // Отримання URL зображення
      return await getDownloadURL(imageRef);
    }));

    // Збереження повідомлення разом із URL зображень у базу даних
    const messageRef = push(ref(getDatabase(), `guilds/${guildId}/chats/${chatId}/messages`));

    await set(messageRef, {
      text: messageText,
      imageUrls: imageUrls, // Збереження масиву зображень
      timestamp: Date.now(),
      senderId: userId
    });

    Alert.alert("Повідомлення успішно додано!");

  } catch (error) {
    Alert.alert("Помилка", `Не вдалося завантажити зображення: ${error.message}`);
  }
};

  
  

  const handleMenuOptionSelect = async (option) => {
    console.log("selectedChatId:", chatId);
  
    if (selectedMessageId) {
      const selectedMessage = messages
        .flatMap(group => group.messages)
        .find(message => message.id === selectedMessageId);
  
      if (!selectedMessage) return;
  
      if (option === 'translate') {
        try {
          // Отримання посилання на переклад у Firebase Realtime Database
          const translationRef = ref(database, `guilds/${guildId}/chats/${chatId}/messages/${selectedMessageId}/translate/${locale.code}`);
  
          // Перевірка наявності перекладу
          const snapshot = await get(translationRef);
          if (snapshot.exists()) {
            // Якщо переклад існує, відображаємо його в модальному вікні
            setTranslatedText(snapshot.val());
            setModalVisible(true);
          } else {
            // Якщо перекладу немає, викликаємо функцію перекладу
            const translatedText = await translateMessage(selectedMessage.text, locale.code);
  
            // Зберігаємо переклад у Firebase
            await set(translationRef, translatedText);
  
            // Відображаємо перекладений текст у модальному вікні
            setTranslatedText(translatedText);
            setModalVisible(true);
          }
        } catch (error) {
          console.error("Error translating or saving message:", error);
        }
      }
  
      // Очистіть вибраний ID після обробки
      setSelectedMessageId(null);
    }
  };
  







  const isPersonalMessage = async (message) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId === null) {
        // Якщо немає userId в AsyncStorage, можна повернути false або обробити випадок
        return false;
      }
      return message.senderId === userId || message.receiverId === userId;
    } catch (error) {
      console.error("Помилка при отриманні userId з AsyncStorage:", error);
      return false;
    }
  };

  const handlePressMessage = (messageId) => {
    console.log("Message pressed:", messageId);
    setSelectedMessageId(messageId);
  };
  

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    try {
      const db = getDatabase();
      if (!chatId || !userId || !guildId) throw new Error("Missing IDs");
      const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);
      const newMessageRef = push(messageRef);
      await set(newMessageRef, {
        senderId: userId,
        text: newMessage,
        timestamp: Date.now(),
      });

      setNewMessage("");
      setInputHeight(40);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.min(height, maxInputHeight));
  };

  const renderItem = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateBlock}>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      {item.messages.map(async (message, index) => {
        const isCurrentUser = message.senderId === userId;
        const isLastMessageFromUser = (
          index === item.messages.length - 1 ||
          (item.messages[index + 1] && item.messages[index + 1].senderId !== message.senderId)
        );
    
        // Перевірка, чи є повідомлення особистим
        const isPersonal = await isPersonalMessage(message);
    
        
    
        return (
          <Menu
            style={styles.menu}
            key={message.id}
          >
            <MenuTrigger
              onPress={() => handlePressMessage(message.id)}
            >
              <View
                style={[
                  styles.messageContainer,
                  isCurrentUser ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <View style={styles.messageInnerContainer}>
                  <Text style={styles.messageText}>{message.text}</Text>
                  <Text 
                    style={[
                      styles.messageDate, 
                      isCurrentUser ? styles.messageDateMy : null
                    ]}
                  >
                    {format(new Date(message.timestamp), 'H:mm', { locale })}
                  </Text>
                </View>
                {isLastMessageFromUser && (
                  <View
                    style={[
                      styles.triangle,
                      isCurrentUser ? styles.triangleMy : styles.triangleTheir,
                    ]}
                  />
                )}
              </View>
            </MenuTrigger>
            <MenuOptions style={isPersonal ? styles.popupMenuPersonal : styles.popupMenuInterlocutor}>
              {isCurrentUser ? (
                <>
                  <MenuOption value="reply" onSelect={() => handleMenuOptionSelect('reply')}>
                    <Text>Відповісти</Text>
                  </MenuOption>
                  <MenuOption value="copy" onSelect={() => handleMenuOptionSelect('copy')}>
                    <Text>Копіювати</Text>
                  </MenuOption>
                  <MenuOption value="attach" onSelect={() => handleMenuOptionSelect('attach')}>
                    <Text>Прикріпити</Text>
                  </MenuOption>
                  <MenuOption value="edit" onSelect={() => handleMenuOptionSelect('edit')}>
                    <Text>Редагувати</Text>
                  </MenuOption>
                  <MenuOption value="delete" onSelect={() => handleMenuOptionSelect('delete')}>
                    <Text>Видалити</Text>
                  </MenuOption>
                </>
              ) : (
                <>
                  <MenuOption value="reply" onSelect={() => handleMenuOptionSelect('reply')}>
                    <Text>Відповісти</Text>
                  </MenuOption>
                  <MenuOption value="copy" onSelect={() => handleMenuOptionSelect('copy')}>
                    <Text>Копіювати</Text>
                  </MenuOption>
                  <MenuOption value="attach" onSelect={() => handleMenuOptionSelect('attach')}>
                    <Text>Прикріпити</Text>
                  </MenuOption>
                  <MenuOption value="translate" onSelect={() => handleMenuOptionSelect('translate')}>
                    <Text>Перекласти</Text>
                  </MenuOption>
                </>
              )}
            </MenuOptions>
          </Menu>
        );
      })}
    </View>
  );
  

  return (
    <View style={styles.container}>
      <FlatList
        data={messages.length > 0 ? messages : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.date + item.messages[0].id}
        style={styles.messagesList}
        
      />
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon icon={faFaceSmile} size={24} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={newMessage}
            onChangeText={setNewMessage}
            onContentSizeChange={handleContentSizeChange}
            multiline
            placeholder="Write a message..."
          />
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => {
              if (newMessage.trim()) {
                handleSendMessage();
              } else {
                uploadImageAndSaveMessage("hghghj", chatId);
              }
            }}
          >
            <FontAwesomeIcon 
              icon={newMessage.trim() ? faPaperPlane : faPaperclip} 
              size={24} 
              style={newMessage.trim() ? styles.blueIcon : styles.defaultIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Переклад</Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.translatedText}>{translatedText}</Text>
            </ScrollView>
            <Button title="Закрити" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  dateGroup: {
    marginBottom: 10,
  },
  dateBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  date: {
    fontSize: 14,
    color: "#fff",
    backgroundColor: "#999",
    padding: 5,
    borderRadius: 10,
  },

  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    minWidth: screenWidth / 2, // Мінімальна ширина повідомлення
    position: 'relative', // Необхідно для позиціонування "хвостиків"
  },
  messageInnerContainer: {
    padding: 2,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  blueIcon: {
    color: "#007bff",
  },
  defaultIcon: {
    color: "#ccc",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    position: 'absolute',
  },
  triangleMy: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "#DCF8C6",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    bottom: -25,
    right: -15,
  },
  triangleTheir: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#ECECEC",
    bottom: -25,
    left: -15,
  },
  messageDateMy: {
    alignSelf: 'flex-end', // Вирівнювання по правому краю
    marginTop: 4, // Можна додати додатковий відступ для відокремлення часу від тексту
    color: '#aaa', // Можна налаштувати колір часу
  },
  menu: {
    position: 'relative',
    
    //bottom: 50, // Можна змінити для відповідності з вашим дизайном
    
  },
  popupMenuInterlocutor: {
    
    position: 'absolute',
    left: 10,  // Відступ зліва для співрозмовника
    top: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі
  },
  // Стиль для попап меню особистих повідомлень
  popupMenuPersonal: {
    backgroundColor:  'red',
    position: 'absolute',
    right: -155,  // Відступ справа для особистих повідомлень
    top: 0,
    fontSize: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі, такі ж як для співрозмовника
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%', // Модальне вікно займає не більше половини екрану
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  translatedText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default ChatWindow;