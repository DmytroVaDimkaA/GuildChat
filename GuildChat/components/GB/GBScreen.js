import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import GBChatList from './GBChatList'; // Імпортуємо GBChatList
import MessageList from './GBMessageList'; // Компонент для відображення повідомлень в чаті
import MessageInput from './GBMessageInput'; // Компонент для введення нових повідомлень
import Header from '../Header';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Імпортуємо AsyncStorage
import { database } from '../../firebaseConfig'; // Імпортуємо Firebase з конфігураційного файлу
import { ref, get } from 'firebase/database'; // Імпортуємо функції для доступу до бази даних
import { useTranslation } from 'react-i18next';

const GBScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [userRole, setUserRole] = useState(null); // Зберігаємо роль користувача

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Отримання userId з AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error(t("gbScreen.userIdError")); // "Не вдалося отримати userId"

        // Отримання guildId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId');
        if (!guildId) throw new Error(t("gbScreen.guildIdError")); // "Не вдалося отримати guildId"

        // Отримання ролі користувача з Firebase
        const roleRef = ref(database, `users/${userId}/${guildId}/role`);
        const roleSnapshot = await get(roleRef);
        const role = roleSnapshot.val();
        if (!role) throw new Error(t("gbScreen.roleError")); // "Не вдалося отримати роль користувача"

        setUserRole(role);

        console.log('Роль користувача:', role);
        // Завантаження початкових повідомлень (якщо потрібно)
      } catch (error) {
        console.error(t("gbScreen.loadUserDataError"), error);
      }
    };
    fetchUserData();
  }, []);

  const handleSendMessage = (message) => {
    setMessages([...messages, { id: messages.length.toString(), text: message }]);
  };

  const handleSelectChat = (chat) => {
    if (chat.name === t("gbScreen.gbTitle")) {
      navigation.navigate('MyGB');
    } else {
      setSelectedChat(chat);
    }
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
          <GBChatList 
            onSelectChat={handleSelectChat} 
            userRole={userRole} // Передаємо роль користувача
          />
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
  },
});

export default GBScreen;
