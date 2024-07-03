import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import RoleSelectionScreen from "./components/RoleSelectionScreen";
import AdminSettingsScreen from "./components/AdminSettingsScreen";
import MainContent from "./components/MainContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserSettingsScreen from "./components/UserSettingsScreen";

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Сервер");
  const [userData, setUserData] = useState(false);
  const [checked, setChecked] = useState(false);
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
      // await AsyncStorage.clear();
      const guildId = await AsyncStorage.getItem("guildId");
      const userId = await AsyncStorage.getItem("userId");
      console.log(guildId, userId);
      if (guildId && userId) {
        setUserData(true);
      }
    } catch {
    } finally {
      setChecked(true);
    }
  };

  if (!checked) {
    return;
  }

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
        <UserSettingsScreen fetch={fetch} />
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
