import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { database } from "./firebaseConfig";
import { ref, onValue } from "firebase/database";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import MainContent from "./components/MainContent";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Сервер");
  const [userData, setUserData] = useState(false);

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
    const guildId = await AsyncStorage.getItem("guildId");
    const userId = await AsyncStorage.getItem("userId");

    if (guildId && userId) {
      setUserData(true);
    }
  };
  if (userData) {
    return <MainContent />;
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
        <View>{/* Здесь можно добавить контент для роли "user" */}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
