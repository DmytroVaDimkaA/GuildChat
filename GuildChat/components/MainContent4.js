import * as React from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerToggleButton } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { database } from "../firebaseConfig";
import GBScreen from "./GB/GBScreen";
import AdminScreen from "./Admin";
import GVGScreen from "./GVG";
import QuantScreen from "./Quant";
import ServiseScreen from "./Servise";
import ChatScreen from "./Chat/ChatScreen";
import AzbookScreen from "./Azbook";
import GB from "./ico/GB.svg";
import Admin from "./ico/admin.svg";
import GVG from "./ico/GVG.svg";
import Quant from "./ico/quant.svg";
import Servise from "./ico/servise.svg";
import Chat from "./ico/Chat.svg";
import Azbook from "./ico/azbook.svg";
import Profile from "./ico/profile.svg";
import GuildMembersList from "./GuildMemberList";
import MyGB from "./GB/MyGB";
import firebase from '@react-native-firebase/app';

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
            <Stack.Screen name="MyGB" component={MyGB} />
        </Stack.Navigator>
    );
}

function CustomDrawerContent(props) {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.header}>
                <Text>hghjhjhjhjvbhnhb</Text>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    stripText: {
        color: 'white',
        fontSize: 20
    }
});
