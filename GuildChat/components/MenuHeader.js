import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const MenuHeader = () => {
  const [userData, setUserData] = useState({
    userImageUrl: '',
    userName: '',
    worldName: ''
  });

  useEffect(() => {
    const db = getFirestore();
    const userRef = doc(db, 'users', 'user-id'); // Замініть 'user-id' на реальний ідентифікатор користувача

    const unsubscribe = onSnapshot(userRef, (doc) => {
      setUserData(doc.data());
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.headerContainer}>
      <Image source={{ uri: userData.userImageUrl }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.userName}>{userData.userName}</Text>
        <Text style={styles.worldName}>{userData.worldName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff', // Змінити на ваш колір фону
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textContainer: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  worldName: {
    fontSize: 14,
    color: '#666',
  },
});

export default MenuHeader;
