import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
const RoleSelectionScreen = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRolePress = (role) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.65; // 80% от ширины экрана

  const styles = StyleSheet.create({
    container: {
      //flex: 1,
      backgroundColor: '#FFFFFF',
      //padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      //column
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
    alignItems: 'center',
    width: buttonWidth, // Фиксированная ширина
      
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
      <View style={{ flexDirection: 'column', alignItems: 'center' }}> 
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
    </View>
  );
};

export default RoleSelectionScreen;
