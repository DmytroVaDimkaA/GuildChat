// App.js
import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database } from "./firebaseConfig";
import i18n from "./i18n";
import * as Localization from "expo-localization";
import { parsePlayerBlock } from "./parsePlayerBlock";

// Імпортуємо контекст
import { GuildProvider, GuildContext } from "./GuildContext";

// Імпортуємо навігацію та необхідні компоненти
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import RoleSelectionScreen from "./components/RoleSelectionScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import UserSettingsScreen from "./components/UserSettingsScreen";
import MainContent from "./components/MainContent";

const Stack = createStackNavigator();

const AppContent = () => {
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const { guildId } = useContext(GuildContext);
  // Видаляємо selectedRole – перемикання ролей тепер через навігацію
  const [selectedOption, setSelectedOption] = useState(i18n.t("server"));
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ініціалізація мови
  useEffect(() => {
    const initLanguage = async () => {
      const supportedLanguages = ["uk", "ru", "be", "de"];
      let lang = await AsyncStorage.getItem("userLanguage");
      if (!lang || !supportedLanguages.includes(lang)) {
        const locales = Localization.locales;
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

  // Отримання даних та логування даних гравця
  useEffect(() => {
    const checkAndLogWorldData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const storedGuildId = await AsyncStorage.getItem("guildId");
        if (userId && storedGuildId) {
          const worldId = storedGuildId.split("_")[0];
          const url = `https://foe.scoredb.io/${worldId}/Player/${userId}`;
          const response = await fetch(url);
          const html = await response.text();
          const playerData = parsePlayerBlock(html);

          if (playerData) {
            console.log("Імʼя гравця:", playerData.userName);
            console.log("Аватар:", playerData.avatarUrl);
            console.log("ID гільдії:", playerData.guildId);
            console.log("Назва гільдії:", playerData.guildName);
          } else {
            console.log("Дані не знайдено у вмісті сторінки");
          }
        }
      } catch (error) {
        console.log("Помилка при формуванні або парсингу посилання:", error);
      }
    };

    checkAndLogWorldData();

    if (guildId) {
      fetchUserData();
    } else {
      setLoading(false);
      setChecked(true);
    }
  }, [guildId]);

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

  // Якщо дані користувача є, переходимо до основного контенту
  if (userData) {
    return <MainContent key={guildId} />;
  }

  // Якщо даних користувача немає – надаємо екран навігації для вибору ролі
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelectionScreen">
        <Stack.Screen
          name="RoleSelectionScreen"
          options={{ headerShown: false }}
        >
          {(props) => (
            <RoleSelectionScreen
              {...props}
              selectedOption={selectedOption}
              onCountryPress={(country) => {
                setSelectedOption(country.name);
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="AdminSettingsScreen"
          options={{ headerShown: false }}
        >
          {(props) => (
            <AdminSettingsScreen
              {...props}
              selectedOption={selectedOption}
              onCountryPress={(country) => {
                setSelectedOption(country.name);
              }}
              onConfirm={() => setUserData(true)}
              fetch={handleRefresh}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="UserSettingsScreen"
          options={{ headerShown: false }}
        >
          {(props) => (
            <UserSettingsScreen
              {...props}
              selectedOption={selectedOption}
              onCountryPress={(country) => {
                setSelectedOption(country.name);
              }}
              fetch={handleRefresh}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
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
