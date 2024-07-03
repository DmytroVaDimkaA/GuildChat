import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import AdminSettingsScreen from "./AdminSettingsScreen";
import UserSettingsScreen from "./UserSettingsScreen";

const RoleSelectionScreen = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRolePress = (role) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 30,
      color: "#222222",
    },
    button: {
      backgroundColor: "#0088CC",
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 5,
      marginBottom: 15,
      alignItems: "center",
      width: Dimensions.get("window").width * 0.65, // Вычисляем ширину здесь
    },
    selectedButton: {
      backgroundColor: "#006699",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.container}>
      {selectedRole === "admin" ? (
        <AdminSettingsScreen />
      ) : (
        <>
          <Text style={styles.title}>Виберіть роль:</Text>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <TouchableOpacity
              style={[
                styles.button,
                selectedRole === "admin" && styles.selectedButton,
              ]}
              onPress={() => handleRolePress("admin")}
            >
              <Text style={styles.buttonText}>Адміністратор</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                selectedRole === "user" && styles.selectedButton,
              ]}
              onPress={() => handleRolePress("user")}
            >
              <Text style={styles.buttonText}>Звичайний користувач</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default RoleSelectionScreen;
