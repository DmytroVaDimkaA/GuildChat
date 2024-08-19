import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue } from "firebase/database";
import ChatList from './ChatList'; // Компонент для відображення списку чатів
import MessageList from './ChatMessageList'; // Компонент для відображення повідомлень в чаті
import MessageInput from './ChatMessageInput'; // Компонент для введення нових повідомлень
import { database } from '../../firebaseConfig'; // Імпорт Firebase конфігурації

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Завантаження guildId та userId з AsyncStorage
    const fetchUserData = async () => {
      const storedGuildId = await AsyncStorage.getItem('guildId');
      const storedUserId = await AsyncStorage.getItem('userId');
      setGuildId(storedGuildId);
      setUserId(storedUserId);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (guildId && userId) {
      const chatsRef = ref(database, `guilds/${guildId}/chats`);
      
      // Зчитування чатів, де користувач є учасником
      onValue(chatsRef, (snapshot) => {
        const chatsData = snapshot.val();
        const userChats = [];

        if (chatsData) {
          Object.keys(chatsData).forEach(chatId => {
            const chat = chatsData[chatId];
            if (chat.members && chat.members[userId]) {
              userChats.push({ id: chatId, ...chat });
            }
          });
        }

        setChats(userChats);
      });
    }
  }, [guildId, userId]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {selectedChat ? (
          <>
            <MessageList messages={selectedChat.messages || []} />
            <MessageInput onSendMessage={(message) => handleSendMessage(message, selectedChat.id)} />
          </>
        ) : (
          <ChatList chats={chats} onSelectChat={handleSelectChat} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    marginTop: 100, // Якщо потрібно опустити контент на 100 пікселів
  },
});

export default ChatScreen;
