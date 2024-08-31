import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Animated, SafeAreaView } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerToggleButton } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, getDatabase, get } from "firebase/database";
import { MaterialIcons } from '@expo/vector-icons';
import GBScreen from "./GB/GBScreen";
import MyGB from './GB/MyGB'; // Замініть на ваш шлях
import NewGBChat from './GB/NewGBChat';
import AddGBComponent from './GB/AddGBComponent';
import GuildMembersList from "./GuildMemberList";
import ChatScreen from "./Chat/ChatScreen";
import ChatWindow from './Chat/ChatWindow';
import GB from "./ico/GB.svg";
import Chat from "./ico/Chat.svg";


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const defaultHeaderOptions = {
    headerStyle: {
      backgroundColor: '#517da2',  // Задає зелений колір хедера
    },
    headerTintColor: '#fff', // Колір тексту в хедері
  };

function ChatStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                    title: 'Альтанка',
                    headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
                }}
            />
            <Stack.Screen 
                name="GuildMembersList" 
                component={GuildMembersList}
                options={{
                    title: 'Нове повідомлення',
                }}
            />
             <Stack.Screen name="ChatWindow" component={ChatWindow} />
        </Stack.Navigator>
    );
}

function GBStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen
                name="GBScreen"
                component={GBScreen}
                options={{
                    title: 'Прокачка Величних Споруд',
                    headerLeft: () => <DrawerToggleButton tintColor="#fff" />,
                }}
            />
            <Stack.Screen 
                name="MyGB" 
                component={MyGB} 
                options={{ title: 'Мої Величні Споруди' }} 
            />
            <Stack.Screen 
                name="NewGBChat" 
                component={NewGBChat} 
                options={{ title: 'Нова гілка прокачки ВС' }}
            />
            <Stack.Screen 
                name="AddGBComponent" 
                component={AddGBComponent} 
                options={{ title: 'Додайте ВС до свого списку' }}
            />
        </Stack.Navigator>
    );
}

function CustomDrawerContent(props) {
    const [guildName, setGuildName] = useState('');
    const [userName, setUserName] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchGuildAndUserData = async () => {
            try {
                const guildId = await AsyncStorage.getItem('guildId');
                const userId = await AsyncStorage.getItem('userId');
                
                if (!guildId || !userId) {
                    throw new Error('guildId або userId не знайдено');
                }

                const db = getDatabase();

                // Отримання guildName
                const guildRef = ref(db, `guilds/${guildId}/guildName`);
                const guildSnapshot = await get(guildRef);

                if (guildSnapshot.exists()) {
                    setGuildName(guildSnapshot.val());
                } else {
                    console.error('guildName не знайдено');
                }

                // Отримання userName та imageUrl
                const userRef = ref(db, `guilds/${guildId}/guildUsers/${userId}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    setUserName(userData.userName || '');
                    setImageUrl(userData.imageUrl || '');
                } else {
                    console.error('Дані користувача не знайдено');
                }

                // Отримання гілки, яка відповідає userId
                const userBranchRef = ref(db, `users/${userId}`);
                const userBranchSnapshot = await get(userBranchRef);

                if (userBranchSnapshot.exists()) {
                    const childBranches = userBranchSnapshot.val();
                    for (const childKey in childBranches) {
                        if (childBranches.hasOwnProperty(childKey)) {
                            // Пропускаємо гілку, що відповідає guildId
                            if (childKey !== guildId) {
                                // Перевіряємо, чи має дочірня гілка свої підключення
                                const childBranchRef = ref(db, `users/${userId}/${childKey}`);
                                const childBranchSnapshot = await get(childBranchRef);
                                
                                if (childBranchSnapshot.exists()) {
                                    const grandChildBranches = childBranchSnapshot.val();
                                    if (typeof grandChildBranches === 'object' && grandChildBranches !== null) {
                                        console.log(`Назва гілки: ${childKey}`); // Виводимо назву гілки

                                        // Виводимо значення imageUrl з кожної підгілки
                                        for (const grandChildKey in grandChildBranches) {
                                            if (grandChildBranches.hasOwnProperty(grandChildKey)) {
                                                const grandChildData = grandChildBranches[grandChildKey];
                                                if (grandChildData && grandChildData.imageUrl) {
                                                    console.log(`imageUrl з гілки ${grandChildKey}: ${grandChildData.imageUrl}`);
                                                } else {
                                                    console.log(`Немає imageUrl у ${grandChildKey}`);
                                                }
                                            }
                                        }
                                    } else {
                                        console.log(`Гілка ${childKey} не є об'єктом або порожня.`);
                                    }
                                } else {
                                    console.log(`Дані для гілки ${childKey} не існують.`);
                                }
                            }
                        }
                    }
                } else {
                    console.error('Гілка не знайдена');
                }

            } catch (error) {
                console.error('Помилка при отриманні даних: ', error);
            }
        };

        fetchGuildAndUserData();
    }, []);

    return (
        <DrawerContentScrollView {...props} style={styles.drawerContent}>
            <View>
                <View style={styles.header}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.profileImage}
                        />
                    ) : null}
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.guildName}>{guildName}</Text>
                    
                </View>
                <View style={styles.worldselect}></View>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}


export default function App() {
    return (
        <NavigationContainer>                  
            <Drawer.Navigator drawerContent={props => 
                <CustomDrawerContent {...props} />} initialRouteName="Home">
                <Drawer.Screen
                    name="GB"
                    component={GBStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Величні споруди',
                        title: 'Величні споруди',
                        drawerIcon: ({ color, size }) => (
                            <GB width={size} height={size} fill={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="ChatList"
                    component={ChatStack}
                    options={{
                        headerShown: false,
                        drawerLabel: 'Альтанка',
                        drawerIcon: ({ color, size }) => (
                            <Chat width={size} height={size} fill={color} />
                        ),
                    }}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    drawerContent: {
        //width: 300, // Встановіть бажану ширину меню тут
    },
    header: {
        height: 200,
        backgroundColor: '#517da2',
        justifyContent: 'center',
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 20,
        marginVertical: 20,
    },
    worldselect: {},
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
    },
    userName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    guildName: {
        fontSize: 16,
        color: '#fff',
    },
});
