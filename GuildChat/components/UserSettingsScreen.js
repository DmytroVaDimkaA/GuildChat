import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserSettingsScreen = ({ fetch }) => {
  const [password, setPassword] = useState("");
  const [guilds, setGuilds] = useState([]);

  const selectGuild = async (guild) => {
    await AsyncStorage.setItem("guildId", guild.guildId);
    fetch();
  };

  const apply = async () => {
    const user = await getUser(password);

    if (!user) {
      Alert.alert("Користувача не знайдено", `Спробуйте ввести інший пароль`, [
        { text: "OK" },
      ]);
      return;
    }

    await AsyncStorage.setItem("userId", user.userId);

    const userGuilds = await getGuildsByUser(user);

    if (userGuilds.length <= 0) {
      Alert.alert(
        "Немає гільдій",
        `Користувач не знаходиться в жодній гільдії`,
        [{ text: "OK" }]
      );
      return;
    }

    if (userGuilds.length == 1) {
      selectGuild(userGuilds[0]);
      return;
    }

    setGuilds(userGuilds);
  };

  const getUser = async (password) => {
    const snapshot = await get(ref(database, `users`));
    const userId = Object.keys(snapshot.val()).find(
      (key) => snapshot.val()[key].password == password
    );
    const user = snapshot.val()[userId];

    if (!user) {
      return null;
    }

    return { ...user, userId };
  };

  const getGuildsByUser = async (user) => {
    const guilds = await get(ref(database, `guilds`));
    const guildIds = Object.keys(guilds.val());

    const existGuilds = guildIds
      .map((guildId) => {
        if (user[guildId]) {
          return {
            ...user[guildId],
            guildId,
            ...guilds.val()[guildId],
          };
        }
      })
      .filter((key) => key);

    return existGuilds;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Запросіть код доступу у голови гільдії</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Код доступу"
          // keyboardType="numeric"
          // maxLength={5}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={apply}>
        <Text style={styles.buttonText}>Прийняти</Text>
      </TouchableOpacity>

      <Modal
        visible={guilds.length > 0}
        animationType="slide"
        transparent
        onRequestClose={() => setGuilds([])}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Виберіть гільдію:</Text>
            <FlatList
              data={guilds}
              keyExtractor={(item) => item.guildId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalButton, { marginBottom: 10 }]}
                  onPress={() => {
                    selectGuild(item);
                  }}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.flagImage}
                  />
                  <Text style={styles.modalButtonText}>{item.guildName}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.modalButton, { marginBottom: 10 }]}
              onPress={() => setGuilds([])}
            >
              <Text style={styles.modalButtonText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f2f2f2",
    width: "100%",
  },
  button: {
    backgroundColor: "#29ABE2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 10,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#29ABE2",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    justifyContent: "flex-start",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  flagImage: {
    width: 36,
    height: 24,
    marginRight: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});

export default UserSettingsScreen;
