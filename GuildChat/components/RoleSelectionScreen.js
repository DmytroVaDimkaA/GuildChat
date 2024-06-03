import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const RoleSelectionScreen = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRolePress = (role) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#222222',
    },
    button: {
      backgroundColor: '#0088CC',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 5,
      marginBottom: 15,
      width: '80%',
      alignItems: 'center',
    },
    selectedButton: {
      backgroundColor: '#006699',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Виберіть роль:</Text>
      <TouchableOpacity
        style={[styles.button, selectedRole === 'admin' && styles.selectedButton]}
        onPress={() => handleRolePress('admin')}
      >
        <Text style={styles.buttonText}>Адміністратор</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, selectedRole === 'user' && styles.selectedButton]}
        onPress={() => handleRolePress('user')}
      >
        <Text style={styles.buttonText}>Звичайний користувач</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RoleSelectionScreen;