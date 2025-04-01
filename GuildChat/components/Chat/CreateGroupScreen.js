import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraIcon from "../ico/camera.svg";

const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Очікуємо, що selectedMembers – це масив id користувачів (рядків)
  const { selectedMembers } = route.params || { selectedMembers: [] };

  const [groupName, setGroupName] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [membersInfo, setMembersInfo] = useState([]);
  const [guildName, setGuildName] = useState('');

  // Завантаження даних користувачів за їх id з Firebase
  useEffect(() => {
    const fetchMembersInfo = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        if (!guildId) throw new Error('guildId не знайдено');

        const db = getDatabase();
        const promises = selectedMembers.map(async (memberId) => {
          const userRef = ref(db, `guilds/${guildId}/guildUsers/${memberId}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            return {
              id: memberId,
              userName: userData.userName,
              imageUrl: userData.imageUrl,
            };
          } else {
            return { id: memberId, userName: 'Невідомий', imageUrl: null };
          }
        });

        const data = await Promise.all(promises);
        setMembersInfo(data);
      } catch (error) {
        console.error('Помилка при отриманні даних користувачів: ', error);
      }
    };

    fetchMembersInfo();
  }, [selectedMembers]);

  // Завантаження guildName з Firebase
  useEffect(() => {
    const fetchGuildName = async () => {
      try {
        const guildId = await AsyncStorage.getItem('guildId');
        if (!guildId) throw new Error('guildId не знайдено');

        const db = getDatabase();
        const guildRef = ref(db, `guilds/${guildId}`);
        const snapshot = await get(guildRef);
        if (snapshot.exists()) {
          const guildData = snapshot.val();
          setGuildName(guildData.guildName || '');
        }
      } catch (error) {
        console.error('Помилка при отриманні даних гільдії: ', error);
      }
    };

    fetchGuildName();
  }, []);

  // Функція для вибору зображення групи
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Нам потрібен доступ до фото, щоб обрати зображення.');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setChatImage(result.assets[0].uri);
    }
  };

  // Функція створення групового чату в Firebase та перехід до ChatWindow
  const handleCreateGroup = useCallback(async () => {
    try {
      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');

      if (!guildId || !userId) {
        throw new Error('guildId або userId не знайдено');
      }

      const db = getDatabase();
      const chatsRef = ref(db, `guilds/${guildId}/chats`);
      const newChatRef = push(chatsRef);

      // Формуємо об'єкт members, додаючи себе та вибраних користувачів (за id)
      const members = { [userId]: true };
      selectedMembers.forEach((memberId) => {
        members[memberId] = true;
      });

      // Дані нового групового чату
      const chatData = {
        type: 'group',
        name: groupName || 'Нова група',
        members,
      };

      if (chatImage) {
        chatData.imageUrl = chatImage;
      }

      await set(newChatRef, chatData);
      console.log('Груповий чат створено успішно!');

      // Перехід до стеку ChatWindow у щойно створений чат
      navigation.navigate('ChatWindow', { chatId: newChatRef.key });
    } catch (error) {
      console.error('Помилка при створенні групового чату: ', error);
    }
  }, [groupName, chatImage, selectedMembers, navigation]);

  // Встановлюємо кнопку-галочку у хедері через navigation.setOptions
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleCreateGroup} style={{ marginRight: 15 }}>
          <Ionicons name="checkmark" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleCreateGroup]);

  // Рендер одного учасника – аватар та логін
  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <View style={styles.avatarContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.memberAvatar} />
        ) : (
          <View style={styles.noAvatar}>
            <Text style={styles.avatarInitials}>
              {item.userName ? item.userName.slice(0, 2).toUpperCase() : '??'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.memberName}>{item.userName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Верхня секція: аватар групи та поле введення назви */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.chatImageContainer} onPress={pickImage}>
          {chatImage ? (
            <Image source={{ uri: chatImage }} style={styles.chatImage} />
          ) : (
            <CameraIcon width={40} height={40} fill="#fff" style={styles.placeholderIcon} />
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.groupNameInput}
          placeholder={guildName}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Розділювач */}
      <View style={styles.divider} />

      {/* Заголовок з кількістю учасників */}
      <Text style={styles.membersTitle}>
        {membersInfo.length} учасників
      </Text>

      {/* Список обраних учасників */}
      <FlatList
        data={membersInfo}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        style={styles.membersList}
      />
    </View>
  );
};

export default CreateGroupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  /* Верхня секція */
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  chatImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0088cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  chatImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderIcon: {
    backgroundColor: 'transparent',
  },
  groupNameInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0088cc',
    paddingVertical: 8,
  },
  /* Розділювач */
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  /* Список учасників */
  membersTitle: {
    marginHorizontal: 16,
    marginVertical: 8,
    fontSize: 16,
    color: '#666',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0088cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  noAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  memberName: {
    fontSize: 16,
    color: '#000',
  },
});
