import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
import { format } from 'date-fns';
import { uk, ru, es, fr, de } from 'date-fns/locale'; // Імпортуємо всі потрібні локалі
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';

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
  const [userId, setUserId] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [contactAvatar, setContactAvatar] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [locale, setLocale] = useState(uk); // Локаль за замовчуванням

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

  const handleMenuOptionSelect = (action) => {
    // Обробка вибору опцій меню
    console.log(`Selected action: ${action}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.dateGroup}>
      <View style={styles.dateBlock}>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      {item.messages.map((message, index) => {
        const isCurrentUser = message.senderId === userId;
        const isLastMessageFromUser = (
          index === item.messages.length - 1 ||
          (item.messages[index + 1] && item.messages[index + 1].senderId !== message.senderId)
        );

        return (
          <Menu key={message.id} onSelect={(value) => handleMenuOptionSelect(value)}>
            <TouchableOpacity style={[
              styles.messageContainer,
              isCurrentUser ? styles.myMessage : styles.theirMessage,
            ]}>
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
            </TouchableOpacity>
            <MenuOptions>
              <MenuOption value="edit">
                <Text style={styles.menuOption}>Edit</Text>
              </MenuOption>
              <MenuOption value="delete">
                <Text style={styles.menuOption}>Delete</Text>
              </MenuOption>
              <MenuOption value="cancel">
                <Text style={styles.menuOption}>Cancel</Text>
              </MenuOption>
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
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, { height: inputHeight }]}
          value={newMessage}
          onChangeText={setNewMessage}
          onContentSizeChange={handleContentSizeChange}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dateGroup: {
    marginVertical: 10,
  },
  dateBlock: {
    alignItems: 'center',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    margin: 5,
    maxWidth: screenWidth * 0.8,
  },
  myMessage: {
    backgroundColor: '#d0f4d7',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  messageInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: '#888',
  },
  messageDateMy: {
    textAlign: 'right',
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: 10,
    borderColor: 'transparent',
  },
  triangleMy: {
    borderRightWidth: 10,
    borderRightColor: '#d0f4d7',
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: 'transparent',
  },
  triangleTheir: {
    borderLeftWidth: 10,
    borderLeftColor: '#ffffff',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 10,
    borderTopColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  menuOption: {
    padding: 10,
    fontSize: 16,
  },
});

export default ChatWindow;
