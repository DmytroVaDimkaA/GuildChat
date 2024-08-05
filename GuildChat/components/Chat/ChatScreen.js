import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import ChatList from './ChatList'; // Компонент для відображення списку чатів
import MessageList from './ChatMessageList'; // Компонент для відображення повідомлень в чаті
import MessageInput from './ChatMessageInput'; // Компонент для введення нових повідомлень

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Додано для вибору чату

  useEffect(() => {
    // Завантаження початкових повідомлень із сервера або бази даних
    // Приклад: setMessages(fetchMessagesFromServer());
  }, []);

  const handleSendMessage = (message) => {
    // Надіслати повідомлення на сервер або до бази даних
    // Приклад: sendMessageToServer(message);
   
    // Додати повідомлення до локального стану
    setMessages([...messages, { id: messages.length.toString(), text: message }]);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Завантажити повідомлення для вибраного чату
    // Приклад: setMessages(fetchMessagesForChat(chat.id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {selectedChat ? (
          <>
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <ChatList onSelectChat={handleSelectChat} /> // Відображення списку чатів
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
    marginTop: 100, // Якщо все ще потрібно опустити контент на 100 пікселів
  },
});

export default ChatScreen;
