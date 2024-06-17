import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const AdminSelectScreen = ({ route }) => {
  const { guildData } = route.params;

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Battles: {item.battles}</Text>
      <Text>Points: {item.points}</Text>
      {/* Виведіть інші дані за потреби */}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={guildData}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  name: {
    fontWeight: "bold",
  },
});

export default AdminSelectScreen;