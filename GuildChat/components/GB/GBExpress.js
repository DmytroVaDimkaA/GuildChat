import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FloatingActionButton from '../CustomElements/FloatingActionButton';

const SimpleComponent = () => {
    const navigation = useNavigation();
    const handleFabPress = () => {
        navigation.replace('GBNewExpress'); // Перехід до AddGBComponent
      };
  
  
    return (
    <View style={styles.container}>
      <Text style={styles.text}>Привіт, світ!</Text>
      <View style={styles.floatingActionButton}>
        <FloatingActionButton 
          onPress={handleFabPress} 
          iconName="plus" 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    
    backgroundColor: '#fff'
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 16, // Відстань від нижнього краю екрану
    right: 16,  // Відстань від правого краю екрану
    zIndex: 1,  // Забезпечує, що кнопка буде поверх інших елементів
  },
  text: {
    fontSize: 18,
    color: '#000'
  }
});

export default SimpleComponent;
