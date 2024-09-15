import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import FloatingActionButton from '../CustomElements/FloatingActionButton';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig'; // Імпорт Firebase конфігурації

const ChatList = ({ chats, guildId, userId }) => {
  const navigation = useNavigation();
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(database, `guilds/${guildId}/guildUsers`);
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          setUsersMap(data || {});
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [guildId]);

  const handleFabPress = () => {
    navigation.navigate('GuildMembersList'); // Назва екрану в навігації
  };

  const handleChatSelect = (chat) => {
    navigation.navigate('ChatWindow', { chatId: chat.id });
  };

  const renderItem = ({ item }) => {
    if (item.type === 'private') {
      const otherMemberId = Object.keys(item.members).find(memberId => memberId !== userId);
      const otherUser = usersMap[otherMemberId];

      if (!otherUser) {
        return null;
      }

      return (
        <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item)}>
          <Image source={{ uri: otherUser.imageUrl }} style={styles.avatar} />
          <Text style={styles.chatName}>{otherUser.userName}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleChatSelect(item)}>
        <Text style={styles.chatName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних чатів</Text>} // Повідомлення про порожній список
      />
      <FloatingActionButton 
        onPress={handleFabPress}  // Запуск функції handleFabPress
        iconName="pencil"           // Іконка, яка буде відображатися
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {

    flex: 1,
    padding: 20,
    backgroundColor: 'white', // додаємо явний білий фон
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    //borderBottomWidth: 1,
    //borderBottomColor: '#ddd',
    backgroundColor: '#f2f2f2',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  chatName: {
    fontSize: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  emptyMessage: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#517da2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  icon: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
});

export default ChatList;
