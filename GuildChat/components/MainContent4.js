import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerToggleButton } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, getDatabase, get } from "firebase/database";
import { MaterialIcons } from '@expo/vector-icons';
import GBScreen from "./GB/GBScreen";
import GuildMembersList from "./GuildMemberList";
import ChatScreen from "./Chat/ChatScreen";
import GB from "./ico/GB.svg";
import Chat from "./ico/Chat.svg";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function ChatStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ChatScreen"
                component={ChatScreen}
                options={{
                    title: 'Альтанка',
                    headerLeft: () => <DrawerToggleButton tintColor="black" />,
                }}
            />
            <Stack.Screen 
                name="GuildMembersList" 
                component={GuildMembersList}
                options={{
                    title: 'Нове повідомлення',
                }}
            />
        </Stack.Navigator>
    );
}

function GBStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="GBScreen"
                component={GBScreen}
                options={{
                    title: 'Прокачка Величних Споруд',
                    headerLeft: () => <DrawerToggleButton tintColor="black" />,
                }}
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

                // Отримуємо guildName
                const guildRef = ref(db, `guilds/${guildId}/guildName`);
                const guildSnapshot = await get(guildRef);

                if (guildSnapshot.exists()) {
                    setGuildName(guildSnapshot.val());
                } else {
                    console.error('guildName не знайдено');
                }

                // Отримуємо userName та imageUrl
                const userRef = ref(db, `guilds/${guildId}/guildUsers/${userId}`);
                const userSnapshot = await get(userRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.val();
                    setUserName(userData.userName || '');
                    setImageUrl(userData.imageUrl || '');
                } else {
                    console.error('Дані користувача не знайдено');
                }
            } catch (error) {
                console.error('Помилка при отриманні даних: ', error);
            }
        };

        fetchGuildAndUserData();
    }, []);

    return (
        <DrawerContentScrollView {...props}>
            <View>
                <View style={styles.header}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.profileImage}
                        />
                    ) : null}
                    <Text style={styles.guildName}>{guildName}</Text>
                    <Text style={styles.userName}>{userName}</Text>
                    <TouchableOpacity style={styles.chevronIcon}>
                        <Animated.View>
                            <MaterialIcons name="keyboard-arrow-down" size={30} color="#9ecbea" />
                        </Animated.View>
                    </TouchableOpacity>
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
    stripText: {
        color: 'white',
        fontSize: 20,
        marginTop: 10,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 20,
        overflow: "hidden",
    },
    guildName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    userName: {
        marginTop: 10,
        color: "#9ecbea",
        fontSize: 20,
        marginRight: 40, // додатковий відступ для шеврона
    },
    chevronIcon: {
        marginTop: 5,
        //marginRight: 20,
    },
});
