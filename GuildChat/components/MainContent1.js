import * as React from 'react';
import { Button, View, SafeAreaView, StyleSheet, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

// Головний екран
function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>Home Screen</Text>
        <Button
          onPress={() => navigation.navigate('Notifications')}
          title="Go to notifications"
        />
      </View>
    </SafeAreaView>
  );
}

// Екран повідомлень
function NotificationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.text}>Notifications Screen</Text>
        <Button onPress={() => navigation.goBack()} title="Go back home" />
      </View>
    </SafeAreaView>
  );
}

// Кастомний контент для меню
function CustomDrawerContent(props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <DrawerContentScrollView {...props}>
      <View style={styles.profileIcon}>
              <Image
                source={{ uri: userImageUrl }}
                style={styles.profileIcon}
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userName}</Text>
              <View style={styles.profileContainer}>

                <Text style={styles.profilePhone}>{wordName}</Text>
                <TouchableOpacity style={styles.chevronIcon} onPress={handleChevronPress}>
                  <Animated.View style={animatedStyle}>
                    <MaterialIcons name="keyboard-arrow-down" size={30} color="#9ecbea" />
                  </Animated.View>
                </TouchableOpacity>

              </View>
            </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

// Створення Drawer Navigator
const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
    <NavigationContainer>
      <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />} initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
    </SafeAreaView>
  );
}

// Стилі
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
  },
  blueStrip: {
    height: 200,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: {
    color: 'white',
    fontSize: 20,
  },
});