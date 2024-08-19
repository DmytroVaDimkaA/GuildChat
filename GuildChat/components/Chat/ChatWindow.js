import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatWindow = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { chatId, initialMessage, isGroupChat } = route.params || {};
  const [userId, setUserId] = useState(null);
  const [guildId, setGuildId] = useState(null);

  useEffect(() => {
    const fetchUserIdAndGuildId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedGuildId = await AsyncStorage.getItem('guildId');
        setUserId(storedUserId);
        setGuildId(storedGuildId);
      } catch (error) {
        console.error('Error fetching user or guild ID: ', error);
      }
    };

    fetchUserIdAndGuildId();
  }, []);

  // Fetching chat name from Firebase
  useEffect(() => {
    if (chatId && guildId) {
      const db = getDatabase();
      const chatRef = ref(db, `guilds/${guildId}/chats/${chatId}/name`);

      onValue(chatRef, (snapshot) => {
        const chatName = snapshot.val();
        console.log('Chat Name:', chatName); // Виводимо назву чату в консоль
        if (chatName) {
          navigation.setOptions({ 
            title: isGroupChat ? chatName : `Chat with ${chatName}`,
          });
        }
      });
    }
  }, [chatId, guildId, isGroupChat, navigation]);

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
    if (newMessage.trim() === '') return;

    try {
      const db = getDatabase();
      if (!chatId || !userId || !guildId) throw new Error('Missing IDs');

      const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);
      const newMessageRef = push(messageRef);

      await set(newMessageRef, {
        senderId: userId,
        text: newMessage,
        timestamp: Date.now(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.senderId === userId ? styles.myMessage : styles.theirMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Write a message..."
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default ChatWindow;
