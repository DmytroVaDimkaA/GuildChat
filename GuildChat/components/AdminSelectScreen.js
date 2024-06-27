import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { database } from '../firebaseConfig'; // Припустимо, що це ваш імпорт бази даних Firebase
import { ref, set, get, update } from 'firebase/database';
import CryptoJS from 'react-native-crypto-js';

const AdminSelectScreen = ({ guildData, clanCaption, guildId, uril }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  const handleItemPress = (item) => {
    setSelectedMember(item);
  };

  const handleConfirm = () => {
    if (selectedMember) {
      const selectedUserId = selectedMember.linkUrl.split('/').pop(); // Отримати останній шматок URL як userId

      // Створення запису в гілці guilds
      const guildRef = ref(database, `guilds/${uril}_${guildId}`);
      const guildInfo = {
        guildName: clanCaption,
      };

      set(guildRef, guildInfo)
        .then(() => {
          console.log(`Дані гільдії оновлено в Firebase для гільдії з id: ${uril}_${guildId}`);

          // Додавання членів гільдії до гілки users
          guildData.forEach((member) => {
            const userId = member.linkUrl.split('/').pop();
            const imageUrl = `https://foe.scoredb.io${member.imageUrl}`;
            const userGuildData = {
              [`${uril}_${guildId}`]: {
                imageUrl: imageUrl,
                role: userId === selectedUserId ? 'guildLeader' : 'member', // Визначення ролі
              }
            };

            // Перевірка існування користувача
            get(ref(database, `users/${userId}`))
              .then((snapshot) => {
                if (snapshot.exists()) {
                  // Користувач існує, оновлюємо дані про нову гільдію
                  update(ref(database, `users/${userId}`), userGuildData)
                    .then(() => {
                      console.log(`Дані користувача оновлено в Firebase для гільдії з id: ${uril}_${guildId}`);
                    })
                    .catch((error) => {
                      console.error('Помилка при оновленні даних користувача:', error);
                    });
                } else {
                  // Користувач не існує, створюємо новий запис
                  const userRootRef = ref(database, `users/${userId}`);
                  const encryptedUserId = CryptoJS.AES.encrypt(userId, 'your-encryption-key').toString();
                  const userRootData = {
                    userName: member.name,
                    password: encryptedUserId, // Додавання зашифрованого userId
                    ...userGuildData // Додаємо дані про гільдію
                  };

                  set(userRootRef, userRootData)
                    .then(() => {
                      console.log(`Основні дані користувача оновлено в Firebase для користувача з userId: ${userId}`);
                    })
                    .catch((error) => {
                      console.error('Помилка при оновленні основних даних користувача:', error);
                    });
                }
              })
              .catch((error) => {
                console.error('Помилка при перевірці існування користувача:', error);
              });
          });

          // Виведення отриманих даних з AdminSettingsScreen у консоль
          console.log("Отримані дані з AdminSettingsScreen в AdminSelectScreen:");
          console.log("guildData:", guildData);
          console.log("clanCaption:", clanCaption);
          console.log("guildId:", guildId);

          setSelectedMember(null);
        })
        .catch((error) => {
          console.error('Помилка при оновленні даних гільдії:', error);
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
                <Text style={styles.confirmationText}>Ви підтверджуєте свій акаунт?</Text>
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
    borderRadius: 50,
  },
  modalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdminSelectScreen;
