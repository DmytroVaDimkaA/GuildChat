import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import MainContent from "./components/MainContent4";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserSettingsScreen from "./components/UserSettingsScreen";
import { database } from './firebaseConfig';
import { ref, get, child } from 'firebase/database';

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Сервер");
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  useEffect(() => {
    fetch();
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleCountryPressApp = (country) => {
    setSelectedOption(country.name);
  };

  const fetch = async () => {
    try {
      const guildId = await AsyncStorage.getItem("guildId");
      const userId = await AsyncStorage.getItem("userId");

      // Перевірка в Firebase базі даних
      if (guildId && userId) {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `guildUsers/${guildId}/users/${userId}`));
        if (snapshot.exists()) {
          setUserData(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setChecked(true);
    }
  };

  if (!checked) {
    return null;
  }

  if (userData) {
    return (
      <MainContent 
        selectedComponent={selectedComponent}
        setSelectedComponent={setSelectedComponent}
      />
    );
  }

  return (
    <View style={styles.container}>
      {selectedRole === null ? (
        <RoleSelectionScreen onRoleSelect={handleRoleSelect} />
      ) : selectedRole === "admin" ? (
        <AdminSettingsScreen
          selectedOption={selectedOption}
          onCountryPress={handleCountryPressApp}
          fetch={fetch}
        />
      ) : (
        <UserSettingsScreen fetch={fetch} />
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