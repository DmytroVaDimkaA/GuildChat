// App.js
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

// Імпортуємо контекст
import { GuildProvider, GuildContext } from "./GuildContext";

// Імпортуємо ваші компоненти
import UserSettingsScreen from "./components/UserSettingsScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import MainContent from "./components/MainContent";

const AppContent = () => {
  // Отримуємо guildId з контексту
  const { guildId } = useContext(GuildContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Сервер");
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Запуск завантаження даних, guildId =", guildId);
    if (guildId) {
      fetchUserData();
    } else {
      // Якщо guildId не знайдено, припускаємо, що користувач ще не обрав світ
      setLoading(false);
      setChecked(true);
    }
  }, [guildId]);

  // Функція вибору ролі
  const handleRoleSelect = (role) => {
    console.log("Обрана роль:", role);
    setSelectedRole(role);
  };

  // Функція обробки натискання по опції (наприклад, країні)
  const handleCountryPressApp = (country) => {
    setSelectedOption(country.name);
  };

  // Функція перевірки наявності даних користувача в AsyncStorage та Firebase
  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("guildId =", guildId, ", userId =", userId);
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
          setLoading(false);
        });
      } else {
        console.log("Дані відсутні: guildId або userId не знайдено");
        setUserData(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Помилка при отриманні даних: ", error);
      setLoading(false);
    } finally {
      setChecked(true);
    }
  };

  // Функція оновлення даних користувача (наприклад, після зміни світу)
  const handleRefresh = () => {
    console.log("handleRefresh викликано – оновлюємо дані користувача");
    fetchUserData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!checked) {
    return null;
  }

  if (userData) {
    // Використовуємо key={guildId} для примусового перемонтування MainContent при зміні guildId
    return <MainContent key={guildId} />;
  }

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : selectedRole === "admin" ? (
        <AdminSettingsScreen
          selectedOption={selectedOption}
          onCountryPress={handleCountryPressApp}
          onConfirm={() => setUserData(true)}
          fetch={handleRefresh}
        />
      ) : (
        <UserSettingsScreen
          fetch={handleRefresh}
          selectedOption={selectedOption}
          onCountryPress={handleCountryPressApp}
        />
      )}
    </View>
  );
};

export default function App() {
  return (
    <GuildProvider>
      <AppContent />
    </GuildProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
