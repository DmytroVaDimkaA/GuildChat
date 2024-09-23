import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const GuildMembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);

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

  const handleTap = (member) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(member.id)) {
        return prevSelected.filter(id => id !== member.id); // Зняти галочку
      } else {
        return [...prevSelected, member.id]; // Додати галочку
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]); // Зняти всі галочки
    } else {
      const allMemberIds = members.map(member => member.id);
      setSelectedMembers(allMemberIds); // Вибрати всіх
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleTap(item)}>
      <View style={styles.memberContainer}>
        <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Text style={styles.memberName}>{item.name}</Text>
          {selectedMembers.includes(item.id) && (
            <Text style={styles.checkmark}>✔️</Text> // Відображення галочки
          )}
          <Text style={styles.memberStatus}>активність — недавно</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {selectedMembers.length > 0 && (
        <View style={styles.selectionInfo}>
          <View style={styles.selectionRow}>
            <Text style={styles.selectionText}>
              Обрано {selectedMembers.length} користувачів
            </Text>
            <Button 
              title="Додати" 
              onPress={() => {/* Логіка для кнопки */}} 
              disabled={selectedMembers.length === 1} // Кнопка пасивна при одному вибраному користувачі
            />
          </View>
        </View>
      )}
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.selectAllContainer}>
        <Button 
          title={selectedMembers.length === members.length ? "Зняти всіх" : "Обрати всіх"} 
          onPress={handleSelectAll} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    position: 'relative',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberStatus: {
    fontSize: 14,
    color: 'gray',
  },
  checkmark: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 20,
  },
  selectionInfo: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionText: {
    fontSize: 16,
    flex: 1,
  },
  selectAllContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default GuildMembersList;
