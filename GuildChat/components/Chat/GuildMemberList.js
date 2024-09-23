import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get, child, push, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const GuildMembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGuildMembers = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        const userId = await AsyncStorage.getItem('userId');

        if (!guildId || !userId) {
          throw new Error('guildId або userId не знайдено');
        }

        const db = getDatabase();
        const guildRef = ref(db, `guilds/${guildId}/guildUsers`);

        const snapshot = await get(guildRef);

        if (snapshot.exists()) {
          const guildMembers = [];
          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key !== userId) {
              const memberData = childSnapshot.val();
              guildMembers.push({
                id: childSnapshot.key,
                name: memberData.userName,
                avatarUrl: memberData.imageUrl,
              });
            }
          });

          setMembers(guildMembers);
        } else {
          console.error('Дані не знайдено');
        }
      } catch (error) {
        console.error('Помилка при отриманні членів гільдії: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuildMembers();
  }, []);

  const handlePress = async (member) => {
    try {
      const db = getDatabase();
      const userId = await AsyncStorage.getItem('userId');
      const guildId = await AsyncStorage.getItem('guildId');
  
      const chatsRef = ref(db, `guilds/${guildId}/chats`);
      const snapshot = await get(chatsRef);
      let chatId = null;
      let chatExists = false;
  
      snapshot.forEach((childSnapshot) => {
        const chatData = childSnapshot.val();
        if (
          chatData.type === 'private' &&
          chatData.members &&
          chatData.members[userId] &&
          chatData.members[member.id]
        ) {
          chatId = childSnapshot.key;
          chatExists = true;
        }
      });
  
      if (!chatExists) {
        const newChatRef = push(ref(db, `guilds/${guildId}/chats`));
        chatId = newChatRef.key;
        await set(newChatRef, {
          members: {
            [userId]: true,
            [member.id]: true
          },
          name: `Private Chat with ${member.name}`,
          type: 'private',
          messages: {}
        });
      }
  
      navigation.navigate('ChatWindow', { chatId, initialMessage: !chatExists });
    } catch (error) {
      console.error('Error creating or opening chat: ', error);
    }
  };
  

  

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.memberContainer}>
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberStatus}>активність — недавно</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <FlatList
      data={members}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  memberContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberStatus: {
    fontSize: 14,
    color: 'gray',
  },
});

export default GuildMembersList;
