import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

const AdminSelectScreen = ({ guildData }) => {
  // Проверка на пустые данные
  if (!guildData || guildData.length === 0) {
    return <Text style={styles.errorText}>Гильдия не найдена или данные отсутствуют</Text>;
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* Проверка наличия URL изображения */}
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image} 
          onError={(e) => console.warn('Ошибка загрузки изображения:', e.nativeEvent.error)} // Добавлено для отладки
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>Battles: {item.battles}</Text>
        <Text>Points: {item.points}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={guildData} // Данные для списка
        renderItem={renderItem} // Функция для рендеринга элемента
        keyExtractor={(item) => item.name} // Уникальный ключ для каждого элемента
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (стили)
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  }
});

export default AdminSelectScreen;
