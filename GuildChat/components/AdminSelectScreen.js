import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { database } from '../firebaseConfig'; // Припустимо, що це ваш імпорт бази даних Firebase
import { ref, set } from 'firebase/database';

const AdminSelectScreen = ({ guildData, clanCaption, uril, guildId }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  const handleItemPress = (item) => {
    setSelectedMember(item);
  };

  const handleConfirm = () => {
    if (selectedMember) {
      const userId = selectedMember.linkUrl.split('/').pop(); // Отримати останній шматок URL як userId
      const imageUrl = `https://foe.scoredb.io${selectedMember.imageUrl}`; // imageUrl користувача
      const updatedGuildId = `${uril}_${guildId}`; // Формування нового значення guildId
      const userName = selectedMember.name; // Отримання userName
      const role = "member"; // Визначення ролі користувача (у даному випадку це просто "member", але може бути динамічним)
  
      // Функція для оновлення даних користувача у базі даних Firebase
      const updateUserDetails = (userId, guildId, imageUrl, userName, role) => {
        const userRef = ref(database, `users/${userId}`);
        const userGuildRef = ref(database, `users/${userId}/${guildId}`);
        return Promise.all([
          set(userGuildRef, { imageUrl, role }),
          set(userRef, { userName, [`${guildId}`]: { imageUrl, role } })
        ]);
      };
  
      // Функція для створення нової гілки у базі даних Firebase
      const createGuildBranch = (guildId, guildName) => {
        const guildRef = ref(database, `guilds/${guildId}`);
        return set(guildRef, { guildName });
      };
  
      updateUserDetails(userId, updatedGuildId, imageUrl, userName, role)
        .then(() => {
          console.log(`Дані користувача оновлено у Firebase для користувача з userId: ${userId}, guildId: ${updatedGuildId}`);
  
          // Створення нової гілки у базі даних Firebase
          return createGuildBranch(updatedGuildId, clanCaption);
        })
        .then(() => {
          console.log(`Гілку guilds/${updatedGuildId} створено з guildName: ${clanCaption}`);
  
          // Виведення отриманих даних з AdminSettingsScreen у консоль
          console.log("Отримані дані з AdminSettingsScreen в AdminSelectScreen:");
          console.log("guildData:", guildData);
          console.log("clanCaption:", clanCaption);
          console.log("uril:", uril);
          console.log("guildId:", guildId);
          console.log("updatedGuildId:", updatedGuildId); // Вивід нової константи у консоль
  
          setSelectedMember(null);
        })
        .catch((error) => {
          console.error('Помилка при оновленні даних користувача або створенні гілки:', error);
        });
    }
  };
  
  
  
  const handleCancel = () => {
    setSelectedMember(null);
  };

  const renderItem = ({ item }) => {
    const imageUrl = `https://foe.scoredb.io${item.imageUrl}`;
    const isLoading = imageLoadingStates[item.name] ?? true;

    return (
      <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.itemButton}>
        <View style={styles.itemContainer}>
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                onLoadEnd={() => setImageLoadingStates(prev => ({ ...prev, [item.name]: false }))}
                onError={(error) => {
                  console.warn('Ошибка загрузки изображения проигнорирована:', error);
                  setImageLoadingStates(prev => ({ ...prev, [item.name]: false }));
                }}
              />
            ) : null}
          </View>
          {isLoading && <ActivityIndicator size="small" color="#fff" />}
          <Text style={styles.name}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Оберіть свій акаунт</Text>
      <FlatList
        data={guildData}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        ListEmptyComponent={<Text style={styles.errorText}>Гильдия не найдена или данные отсутствуют</Text>}
      />

      <Modal visible={selectedMember !== null} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <Image source={{ uri: `https://foe.scoredb.io${selectedMember.imageUrl}` }} style={styles.modalImage} />
                <Text style={styles.modalName}>{selectedMember.name}</Text>
                <Text style={styles.confirmationText}>Ви підтверджує свій акаунт?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={handleConfirm} style={styles.button}>
                    <Text style={styles.buttonText}>Підтвердити</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancel} style={styles.button}>
                    <Text style={styles.buttonText}>Відміна</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemButton: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#64B5F6',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 16,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#64B5F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
});

export default AdminSelectScreen;

