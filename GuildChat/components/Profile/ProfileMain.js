import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Для інших іконок
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClock, faGlobe } from '@fortawesome/free-solid-svg-icons';
import GBIcon from '../ico/GB.svg'; // тепер імпортуємо як компонент

const ProfileMain = () => {
  const [userName, setUserName] = useState('');
  const [activeWorld, setActiveWorld] = useState('');
  const [guilds, setGuilds] = useState([]);

  const navigation = useNavigation();

  // Функція для перетворення ролей
  const convertRole = (role) => {
    if (role === 'guildLeader') return 'Адміністратор';
    if (role === 'member') return 'Користувач';
    return role;
  };

  useEffect(() => {
    // Завантаження базових даних: userName та активний світ
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const guildId = await AsyncStorage.getItem('guildId');

        if (userId) {
          const userNameRef = ref(database, `/users/${userId}/userName`);
          onValue(userNameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setUserName(data);
            }
          });
        } else {
          console.log('userId не знайдено в AsyncStorage');
        }

        if (guildId) {
          const activeWorldRef = ref(database, `/guilds/${guildId}/worldName`);
          onValue(activeWorldRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setActiveWorld(data);
            }
          });
        } else {
          console.log('guildId не знайдено в AsyncStorage');
        }
      } catch (error) {
        console.error('Помилка отримання даних:', error);
      }
    };

    // Отримання даних усіх гілок, ім’я яких містить символ "_"
    const fetchUserGuilds = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('userId не знайдено в AsyncStorage');
          return;
        }

        // Отримуємо всі дані користувача
        const userRef = ref(database, `/users/${userId}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          // Фільтруємо ключі, що містять "_"
          const guildKeys = Object.keys(userData).filter(key => key.includes('_'));

          const results = await Promise.all(
            guildKeys.map(async (guildId) => {
              const role = userData[guildId].role;
              const guildRef = ref(database, `/guilds/${guildId}/worldName`);
              const guildSnapshot = await get(guildRef);
              const worldName = guildSnapshot.exists() ? guildSnapshot.val() : 'Не знайдено';
              return { guildId, role, worldName };
            })
          );
          setGuilds(results);
          console.log('Отримані дані:', results);
        } else {
          console.log('Дані користувача не знайдені');
        }
      } catch (error) {
        console.error('Помилка отримання даних для guilds:', error);
      }
    };

    fetchData();
    fetchUserGuilds();
  }, []);

  // Функція для відкриття стека ProfileData
  const handleProfileData = () => {
    navigation.navigate('ProfileData');
  };

  const handleAddSchedule = () => {
    navigation.navigate('AddSchedule');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Шапка: аватар, юзернейм та активний світ */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      {/* Розділ "Ігрові світи" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ігрові світи</Text>

        {/* Блок з даними гілок */}
        <View style={styles.section}>
          {guilds.length > 0 ? (
            guilds.map((guild) => (
              <View key={guild.guildId} style={styles.itemRowNoBorder}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.mainText}>{guild.worldName}</Text>
                  {guild.worldName === activeWorld && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#0088cc"
                      style={{ marginLeft: 5 }}
                    />
                  )}
                </View>
                <Text style={styles.mainText}>{convertRole(guild.role)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.itemRowNoBorder}>
              <Text style={styles.mainText}>Дані не знайдено</Text>
            </View>
          )}
        </View>
      </View>

      {/* Горизонтальний роздільник */}
      <View style={styles.divider} />

      {/* Розділ "Про себе" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Про себе</Text>
        <TouchableOpacity style={styles.itemRow} onPress={handleProfileData}>
          <View style={styles.textContainer}>
            <Text style={styles.mainText}>Я користувач</Text>
            <Text style={styles.subText}>Додайте кілька слів про себе</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Горизонтальний роздільник */}
      <View style={styles.divider} />

      {/* Розділ з додатковими налаштуваннями */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Налаштування додатку</Text>
        <TouchableOpacity style={styles.itemRow}>
    <GBIcon width={24} height={24} style={{ marginRight: 8 }} />
    <Text style={styles.mainText}>Налаштування ВС</Text>
  </TouchableOpacity>      
        <TouchableOpacity style={styles.itemRow} onPress={handleAddSchedule}>
          <FontAwesomeIcon icon={faClock} size={24} color="#BDBDBD" style={{ marginRight: 8 }} />
          <Text style={styles.mainText}>Розклад</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.itemRow}>
          <FontAwesomeIcon icon={faGlobe} size={24} color="#BDBDBD" style={{ marginRight: 8 }} />
          <Text style={styles.mainText}>Мова</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileMain;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Верхній блок: аватар, юзернейм та активний світ
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#517da2',
  },
  headerTextContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  activeWorldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  activeWorldLeft: {
    fontSize: 14,
    color: '#9ecbea',
  },
  activeWorldRight: {
    fontSize: 14,
    color: '#9ecbea',
    textAlign: 'right',
  },
  divider: {
    height: 8,
    backgroundColor: '#e0e0e0',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0088cc',
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.4,
  },
  itemRowNoBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 14,
    color: '#000',
  },
  subText: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
});
