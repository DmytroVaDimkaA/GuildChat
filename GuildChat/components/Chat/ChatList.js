import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FloatingActionButton from '../FloatingActionButton';
import { useNavigation } from '@react-navigation/native';

const chatData = []; // Порожній список чатів

const ChatList = ({ onSelectChat }) => {
  const navigation = useNavigation();

  const handleFabPress = () => {
    navigation.navigate('GuildMembersList'); // Назва екрану в навігації
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={chatData}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => onSelectChat(item)}>
            <Text style={styles.chatName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Немає доступних чатів</Text>} // Повідомлення про порожній список
      />
      <FloatingActionButton onPress={handleFabPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatName: {
    fontSize: 18,
  },
  emptyMessage: {
    padding: 15,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#517da2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  icon: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
  },
});

export default ChatList;