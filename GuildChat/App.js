import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import MainContent from "./components/MainContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserSettingsScreen from "./components/UserSettingsScreen";
import { database } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Сервер");
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true); // Додано стан завантаження

  useEffect(() => {
    console.log("Запуск завантаження даних");
    fetchUserData();
  }, []);

  const handleRoleSelect = (role) => {
    console.log("Обрана роль:", role);
    setSelectedRole(role);
  };

  const handleCountryPressApp = (country) => {
    setSelectedOption(country.name);
  };

  const fetchUserData = async () => {
    try {
      const guildId = await AsyncStorage.getItem("guildId");
      const userId = await AsyncStorage.getItem("userId");
  
      console.log("Знайдено дані:", guildId, userId);
  
      if (guildId && userId) {
        const userRef = ref(database, `users/${userId}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            console.log("Користувач знайдений у Firebase");
            setUserData(true);
          } else {
            console.log("Користувач не знайдений у Firebase");
            setUserData(false);
          }
          setLoading(false); // Завершуємо завантаження тут
        });
      } else {
        console.log("Дані у AsyncStorage відсутні");
        setUserData(false);
        setLoading(false); // Завершуємо завантаження тут
      }
    } catch (error) {
      console.error("Помилка при отриманні даних: ", error);
      setLoading(false); // Завершуємо завантаження у разі помилки
    } finally {
      setChecked(true);
    }
  };
  

  if (loading) {
    console.log("Відображення спіннера завантаження");
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!checked) {
    console.log("Дані ще не перевірені");
    return null;
  }

  if (userData) {
    console.log("Перехід до MainContent");
    return <MainContent />;
  }

  console.log("Відображення RoleSelectionScreen або User/Admin Settings");

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : selectedRole === "admin" ? (
        <AdminSettingsScreen
          selectedOption={selectedOption}
          onCountryPress={handleCountryPressApp}
          onConfirm={() => setUserData(true)}
        />
      ) : (
        <UserSettingsScreen
          selectedOption={selectedOption}
          onCountryPress={handleCountryPressApp}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
