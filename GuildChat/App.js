// App.js
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import i18n from "./i18n";
import * as Localization from "expo-localization";

// Імпортуємо контекст
import { GuildProvider, GuildContext } from "./GuildContext";

// Імпортуємо ваші компоненти
import UserSettingsScreen from "./components/UserSettingsScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import MainContent from "./components/MainContent";

const AppContent = () => {
  // Визначення локалізації
  const [languageLoaded, setLanguageLoaded] = useState(false);

  // Отримуємо guildId з контексту
  const { guildId } = useContext(GuildContext);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState(i18n.t("server"));
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ініціалізація мови: перевірка в AsyncStorage, використання мови пристрою або встановлення за замовчуванням
  useEffect(() => {
    const initLanguage = async () => {
      const supportedLanguages = ["uk", "ru", "be", "de"];
      let lang = await AsyncStorage.getItem("userLanguage");
      if (!lang || !supportedLanguages.includes(lang)) {
        // Використовуємо expo-localization для отримання поточних локалей
        const locales = Localization.locales;
        // Витягуємо перші два символи з першого елемента (наприклад, "uk" з "uk-UA")
        lang = locales[0]?.substring(0, 2);
        if (!supportedLanguages.includes(lang)) {
          lang = "uk";
        }
        await AsyncStorage.setItem("userLanguage", lang);
      }
      i18n.changeLanguage(lang);
      setLanguageLoaded(true);
    };
    initLanguage();
  }, []);

  useEffect(() => {
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
      if (guildId && userId) {
        const userRef = ref(database, `users/${userId}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(true);
          } else {
            setUserData(false);
          }
          setLoading(false);
        });
      } else {
        setUserData(false);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setChecked(true);
    }
  };

  // Функція оновлення даних користувача (наприклад, після зміни світу)
  const handleRefresh = () => {
    fetchUserData();
  };

  if (!languageLoaded || loading) {
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
