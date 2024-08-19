import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Потрібно встановити react-native-vector-icons

const FloatingActionButton = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.fab} onPress={onPress}>
        <Icon name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginRight: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#517da2', // Синій колір, як у Telegram
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Тінь на Android
    shadowColor: '#000', // Тінь на iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default FloatingActionButton;