import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const ParserOutput = ({ data }) => {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.serverName}>{item.name} ({item.country})</Text>
      <Text style={styles.serverUrl}>{item.server_name}</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.server_name}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  serverName: {
    fontWeight: 'bold',
  },
  serverUrl: {
    color: 'blue',
  },
});

export default ParserOutput; // Экспорт компонента в конце файла
