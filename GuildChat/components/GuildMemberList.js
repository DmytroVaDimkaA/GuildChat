import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get, child } from 'firebase/database';

const GuildMembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuildMembers = async () => {
      try {
        // Отримуємо guildId та userId з AsyncStorage
        const guildId = await AsyncStorage.getItem('guildId');
        const userId = await AsyncStorage.getItem('userId');

        if (!guildId || !userId) {
          throw new Error('guildId або userId не знайдено');
        }

        // Отримуємо посилання на базу даних Firebase
        const db = getDatabase();
        const guildRef = ref(db, `guilds/${guildId}/guildUsers`);

        // Отримуємо дані з гілки guildUsers, крім гілки з userId
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

  const renderItem = ({ item }) => (
    <View style={styles.memberContainer}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberStatus}>активність — недавно</Text>
      </View>
    </View>
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
