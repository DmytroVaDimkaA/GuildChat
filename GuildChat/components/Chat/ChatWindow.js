import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { getDatabase, ref, onValue, push, set } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFaceSmile } from '@fortawesome/free-regular-svg-icons';
import { format } from 'date-fns';

const ChatWindow = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40); // Висота поля для вводу
  const maxInputHeight = 120; // Максимальна висота поля для вводу
  const { chatId, initialMessage, isGroupChat } = route.params || {};
  const [userId, setUserId] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [contactAvatar, setContactAvatar] = useState(null);
  const [contactName, setContactName] = useState(null);

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
    if (chatId && guildId) {
      const db = getDatabase();
      const chatRef = ref(db, `guilds/${guildId}/chats/${chatId}/name`);

      onValue(chatRef, (snapshot) => {
        const chatName = snapshot.val();
        if (chatName) {
          if (isGroupChat) {
            navigation.setOptions({
              title: chatName,
            });
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
                          <Text style={styles.headerTitle}>
                            {contactName}
                          </Text>
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
        setMessages(messagesList);
      });
    };

    fetchMessages();
  }, [chatId, guildId]);

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(); // Send the initial message if needed
    }
  }, [initialMessage]);

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
      setInputHeight(40); // Повернення до початкової висоти після надсилання
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.min(height, maxInputHeight)); // Обмеження висоти
  };

  const renderItem = ({ item, index }) => {
    const isCurrentUser = item.senderId === userId;

    // Перевірка, чи це останнє повідомлення від одного користувача
    const isLastMessageFromUser = (
      index === messages.length - 1 ||
      (messages[index + 1] && messages[index + 1].senderId !== item.senderId)
    );

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View style={styles.messageInnerContainer}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageDate}>
            {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
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
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesomeIcon icon={faFaceSmile} size={24} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { height: inputHeight }]} // Висота поля динамічна
            value={newMessage}
            onChangeText={setNewMessage}
            onContentSizeChange={handleContentSizeChange} // Відстеження зміни контенту
            multiline
            placeholder="Write a message..."
          />
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={newMessage.trim() ? handleSendMessage : null}
          >
            <FontAwesomeIcon 
              icon={newMessage.trim() ? faPaperPlane : faPaperclip} 
              size={24} 
              style={newMessage.trim() ? styles.blueIcon : styles.defaultIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
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
    position: 'relative', // Необхідно для позиціонування "хвостиків"
  },
  messageInnerContainer: {
    padding: 10,
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
});

export default ChatWindow;


