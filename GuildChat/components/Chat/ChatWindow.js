import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal, ScrollView,
  Button,
  Alert
} from "react-native";
import { getDatabase, ref, onValue, push, set, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPaperclip, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { uk, ru, es, fr, de } from 'date-fns/locale'; // Імпортуємо всі потрібні локалі
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import translateMessage from '../../translateMessage'; // Імпорт функції перекладу
import { database, storage } from '../../firebaseConfig'; // Імпортуйте Firebase
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid'; // Для генерації унікальних ID
import { faClock, faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Clipboard } from 'react-native';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import { ActivityIndicator } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
// Об'єкт для керування локалями
const locales = {
  uk: uk,
  ru: ru,
  es: es,
  fr: fr,
  de: de,
  // Додайте інші локалі за потреби
};

const ChatWindow = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const maxInputHeight = 120;
  const { chatId, initialMessage, isGroupChat } = route.params || {};
  console.log('chatId:', chatId); // Додайте цей рядок
  const [downloading, setDownloading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [guildId, setGuildId] = useState(null);
  const [contactAvatar, setContactAvatar] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [locale, setLocale] = useState(uk); // Локаль за замовчуванням
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const storage = getStorage();
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [imageCaption, setImageCaption] = useState("");
  const [captionModalVisible, setCaptionModalVisible] = useState(false);
  const [fullSizeImageUri, setFullSizeImageUri] = useState(null);
  const [fullSizeImageModalVisible, setFullSizeImageModalVisible] = useState(false);

  const [replyToMessage, setReplyToMessage] = useState(null);
  const [replyToMessageText, setReplyToMessageText] = useState('');
  const handleReply = (message) => {
    setReplyToMessage(message);
    setReplyToMessageText(message.text);
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <FontAwesomeIcon icon={faClock} size={14} style={styles.statusIcon} />;
      case 'sent':
        return <FontAwesomeIcon icon={faCheck} size={14} style={styles.statusIcon} />;
      case 'read':
        return (
          <View style={styles.doubleCheckContainer}>
            <FontAwesomeIcon icon={faCheck} size={14} style={styles.statusIcon} />
            <FontAwesomeIcon icon={faCheck} size={14} style={[styles.statusIcon, styles.secondCheck]} />
          </View>
        );
      default:
        return null;
    }
  };
  const flatListRef = useRef(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [attachedMessage, setAttachedMessage] = useState(null);
  const [attachedMessageText, setAttachedMessageText] = useState('');
  const [messageLayouts, setMessageLayouts] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const messageLayoutsRef = useRef({});
  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(40, height), maxInputHeight);
    setInputHeight(newHeight);
  };
  const [messageHeights, setMessageHeights] = useState({});
  const handleFileDownload = async (fileUrl, fileName) => {
    if (downloadingFiles.has(fileName)) return;

    try {
      const newSet = new Set(downloadingFiles);
      newSet.add(fileName);
      setDownloadingFiles(newSet);

      const downloadResumable = FileSystem.createDownloadResumable(
        fileUrl,
        FileSystem.documentDirectory + fileName,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;

        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (uri) {
        await FileSystem.getInfoAsync(uri);
        Alert.alert('Success', 'File downloaded successfully!');
      }

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download file');
    } finally {
      const newSet = new Set(downloadingFiles);
      newSet.delete(fileName);
      setDownloadingFiles(newSet);
    }
  };

  const messageRefs = useRef({});
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const measureMessage = (messageId, layout) => {
    setMessageLayouts(prev => ({
      ...prev,
      [messageId]: layout
    }));
  };
  useEffect(() => {
    if (chatId && guildId) {
      const db = getDatabase();
      const pinnedMessageRef = ref(db, `guilds/${guildId}/chats/${chatId}/pinnedMessage`);

      const unsubscribe = onValue(pinnedMessageRef, async (snapshot) => {
        const pinnedData = snapshot.val();

        if (pinnedData) {
          const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages/${pinnedData.id}`);
          const messageSnapshot = await get(messageRef);

          if (messageSnapshot.exists()) {
            const fullMessage = {
              id: pinnedData.id,
              ...messageSnapshot.val()
            };
            setAttachedMessage(fullMessage);
            setAttachedMessageText(fullMessage.text);
          }
        } else {
          setAttachedMessage(null);
          setAttachedMessageText('');
        }
      });

      return () => unsubscribe();
    }
  }, [chatId, guildId]);

  useEffect(() => {
    const fetchUserIdAndGuildId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedGuildId = await AsyncStorage.getItem("guildId");
        setUserId(storedUserId);
        setGuildId(storedGuildId);
      } catch (error) {
        console.error("Error fetching user or guild ID: ", error);
      }
    };

    fetchUserIdAndGuildId();
  }, []);

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const localeRef = ref(db, `users/${userId}/setting/language`);

      onValue(localeRef, (snapshot) => {
        const localeCode = snapshot.val();
        if (locales[localeCode]) {
          setLocale(locales[localeCode]); // Вибір відповідної локалі
        } else {
          setLocale(uk); // Локаль за замовчуванням
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    if (chatId && guildId) {
      const db = getDatabase();
      const chatRef = ref(db, `guilds/${guildId}/chats/${chatId}/name`);

      onValue(chatRef, (snapshot) => {
        const chatName = snapshot.val();
        if (chatName) {
          if (isGroupChat) {
            navigation.setOptions({ title: chatName });
          } else {
            const chatMembersRef = ref(db, `guilds/${guildId}/chats/${chatId}/members`);
            onValue(chatMembersRef, (snapshot) => {
              const members = snapshot.val() || {};
              const otherUserId = Object.keys(members).find(id => id !== userId);
              if (otherUserId) {
                const userRef = ref(db, `guilds/${guildId}/guildUsers/${otherUserId}`);
                onValue(userRef, (snapshot) => {
                  const userData = snapshot.val();
                  if (userData) {
                    setContactAvatar(userData.imageUrl);
                    setContactName(userData.userName);
                    navigation.setOptions({
                      headerTitle: () => (
                        <View style={styles.headerContent}>
                          {contactAvatar && (
                            <Image
                              source={{ uri: contactAvatar }}
                              style={styles.avatar}
                            />
                          )}
                          <Text style={styles.headerTitle}>{contactName}</Text>
                        </View>
                      ),
                    });
                  }
                });
              }
            });
          }
        }
      });
    }
  }, [chatId, guildId, isGroupChat, navigation, userId, contactAvatar, contactName]);
  useEffect(() => {
    if (!chatId || !userId || !guildId) return;

    const db = getDatabase();
    const messagesRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);

    onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const messages = snapshot.val();
      Object.entries(messages).forEach(([messageId, message]) => {
        if (message.senderId !== userId && message.status !== 'read') {
          set(ref(db, `guilds/${guildId}/chats/${chatId}/messages/${messageId}/status`), 'read');
        }
      });
    });
  }, [chatId, userId, guildId]);

  useEffect(() => {
    const fetchMessages = () => {
      if (!chatId || !guildId) return;

      const db = getDatabase();
      const messagesRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);

      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val() || {};
        const messagesList = Object.keys(messagesData).map((key) => ({
          id: key,
          ...messagesData[key],
        }));

        const groupedMessages = messagesList.reduce((acc, message) => {
          const date = format(new Date(message.timestamp), 'd MMMM', { locale });
          if (!acc[date]) acc[date] = [];
          acc[date].push(message);
          return acc;
        }, {});

        const groupedMessagesArray = Object.keys(groupedMessages).map(date => ({
          date,
          messages: groupedMessages[date]
        }));

        setMessages(groupedMessagesArray);
      });
    };

    fetchMessages();
  }, [chatId, guildId, locale]);

  // Отримання guildId та chatId з AsyncStorage
  const getChatData = async () => {
    try {
      //const guildId = await AsyncStorage.getItem('guildId'); // Замість 'guildId' використайте правильний ключ
      //const chatId = await AsyncStorage.getItem('chatId');   // Замість 'chatId' використайте правильний ключ
      console.log("guildId:", guildId);
      return { guildId, chatId };
    } catch (error) {
      console.error("Не вдалося отримати дані з AsyncStorage:", error);
    }
  };
  const selectFile = async () => {
    try {
      setIsUploading(true);
      const result = await DocumentPicker.getDocumentAsync({});

      if (result.type === 'success') {
        const { uri, name } = result;
        const fileId = uuid.v4();
        const fileRef = storageRef(storage, `files/${fileId}-${name}`);

        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(fileRef, blob);

        const fileUrl = await getDownloadURL(fileRef);

        const messageRef = push(ref(getDatabase(), `guilds/${guildId}/chats/${chatId}/messages`));
        await set(messageRef, {
          text: name,
          fileUrl,
          type: 'file',
          fileName: name,
          timestamp: Date.now(),
          senderId: userId,
          status: 'sent'
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };


  const selectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Увага", "Доступ до медіа-ресурсів не надано.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImageUri(result.assets[0].uri);
        setCaptionModalVisible(true);
      }
    } catch (error) {
      Alert.alert("Помилка", `Не вдалося вибрати зображення: ${error.message}`);
    }
  };

  const uploadImageAndSaveMessage = async () => {
    try {
      if (!selectedImageUri) return;

      const guildId = await AsyncStorage.getItem('guildId');
      const userId = await AsyncStorage.getItem('userId');
      const { chatId } = route.params || {};

      if (!guildId || !chatId) {
        console.error('Не вдалося отримати guildId або chatId.', { guildId, chatId });
        Alert.alert('Помилка', 'Не вдалося отримати guildId або chatId.');
        return;
      }

      const imageId = uuid.v4();
      const imageRef = storageRef(getStorage(), `images/${imageId}.jpeg`);

      const response = await fetch(selectedImageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);

      const imageUrl = await getDownloadURL(imageRef);

      const messageRef = push(ref(getDatabase(), `guilds/${guildId}/chats/${chatId}/messages`));

      await set(messageRef, {
        text: imageCaption,
        imageUrls: [imageUrl],
        timestamp: Date.now(),
        senderId: userId,
        status: 'in-progress',
      });

      Alert.alert("Повідомлення успішно додано!");
      setSelectedImageUri(null);
      setImageCaption("");
      setCaptionModalVisible(false);

    } catch (error) {
      Alert.alert("Помилка", `Не вдалося завантажити зображення: ${error.message}`);
    }
  };

  const handleMenuOptionSelect = async (option) => {
    console.log("selectedChatId:", chatId);

    if (selectedMessageId) {
      const selectedMessage = messages
        .flatMap(group => group.messages)
        .find(message => message.id === selectedMessageId);

      if (!selectedMessage) return;

      if (option === 'translate') {
        try {
          const translationRef = ref(database, `guilds/${guildId}/chats/${chatId}/messages/${selectedMessageId}/translate/${locale.code}`);

          const snapshot = await get(translationRef);
          if (snapshot.exists()) {
            setTranslatedText(snapshot.val());
            setModalVisible(true);
          } else {
            const translatedText = await translateMessage(selectedMessage.text, locale.code);

            await set(translationRef, translatedText);

            setTranslatedText(translatedText);
            setModalVisible(true);
          }
        } catch (error) {
          console.error("Error translating or saving message:", error);
        }
      }

      setSelectedMessageId(null);
    }
  };

  const isPersonalMessage = async (message) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId === null) {
        return false;
      }
      return message.senderId === userId || message.receiverId === userId;
    } catch (error) {
      console.error("Помилка при отриманні userId з AsyncStorage:", error);
      return false;
    }
  };

  const handlePressMessage = (messageId) => {
    console.log("Message pressed:", messageId);
    setSelectedMessageId(messageId);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    try {
      const db = getDatabase();
      if (!chatId || !userId || !guildId) throw new Error("Missing IDs");

      const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages`);
      const newMessageRef = push(messageRef);

      await set(newMessageRef, {
        senderId: userId,
        text: newMessage,
        timestamp: Date.now(),
        status: 'sending',
        replyTo: replyToMessage ? replyToMessage.id : null,
        replyToText: replyToMessage ? replyToMessage.text : null,
      });

      await set(ref(db, `guilds/${guildId}/chats/${chatId}/messages/${newMessageRef.key}/status`), 'sent');

      setNewMessage("");
      setInputHeight(40);
      setReplyToMessage(null);
      setReplyToMessageText('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const handleDeleteMessage = async (deleteForBoth) => {
    if (!messageToDelete) return;

    try {
      const db = getDatabase();
      const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages/${messageToDelete.id}`);

      if (deleteForBoth) {
        await set(messageRef, null);
      } else {
        const updatedMessage = { ...messageToDelete, deletedFor: { [userId]: true } };
        await set(messageRef, updatedMessage);
      }

      setMessages((prevMessages) =>
        prevMessages.map(group => ({
          ...group,
          messages: group.messages.filter(msg => msg.id !== messageToDelete.id)
        }))
      );

      setDeleteModalVisible(false);
      setMessageToDelete(null);
    } catch (error) {
      console.error("Error deleting message: ", error);
    }
  };

  const handleCopyMessage = (message) => {
    Clipboard.setString(message.text);
  };
  const handleEditMessage = (message) => {
    setEditMessage(message);
    setEditMessageText(message.text);
  };
  const handleAttachMessage = async (message) => {
    try {
      const db = getDatabase();
      await set(ref(db, `guilds/${guildId}/chats/${chatId}/pinnedMessage`), {
        id: message.id,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const saveEditedMessage = async () => {
    if (!editMessage || editMessageText.trim() === "") return;

    try {
      const db = getDatabase();
      const messageRef = ref(db, `guilds/${guildId}/chats/${chatId}/messages/${editMessage.id}`);
      await set(messageRef, {
        ...editMessage,
        text: editMessageText,
        edited: true,
      });

      setMessages((prevMessages) =>
        prevMessages.map(group => ({
          ...group,
          messages: group.messages.map(msg =>
            msg.id === editMessage.id ? { ...msg, text: editMessageText, edited: true } : msg
          )
        }))
      );

      setEditMessage(null);
      setEditMessageText('');
    } catch (error) {
      console.error("Error editing message: ", error);
    }
  };


  const scrollToMessage = (messageId) => {
    // Flatten all messages into a single array for easier lookup
    const allMessages = messages.flatMap(group => group.messages);
    const messageIndex = allMessages.findIndex(msg => msg.id === messageId);

    if (messageIndex === -1) return;

    let scrollOffset = 0;
    for (let i = 0; i < messageIndex; i++) {
      const prevMessageId = allMessages[i].id;
      const messageHeight = messageHeights[prevMessageId] || 100; 
      scrollOffset += messageHeight + 10; 
    }

    const dateHeaderHeight = 50; 
    const datesBeforeMessage = new Set(
      allMessages
        .slice(0, messageIndex)
        .map(msg => format(new Date(msg.timestamp), 'd MMMM'))
    ).size;
    scrollOffset += dateHeaderHeight * datesBeforeMessage;

    const windowHeight = Dimensions.get('window').height;
    const centerOffset = windowHeight / 2 - (messageHeights[messageId] || 100) / 2;

    flatListRef.current?.scrollToOffset({
      offset: Math.max(0, scrollOffset - centerOffset),
      animated: true
    });

    setHighlightedMessageId(messageId);
    setTimeout(() => setHighlightedMessageId(null), 1500);
  };


  const renderItem = ({ item }) => (
    <View style={styles.dateGroup}>
     
      <View style={styles.dateBlock}>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      {item.messages
        .filter(message => !message.deletedFor || !message.deletedFor[userId])
        .map((message, index) => {
          const isCurrentUser = message.senderId === userId;
          const isLastMessageFromUser = (
            index === item.messages.length - 1 ||
            (item.messages[index + 1] && item.messages[index + 1].senderId !== message.senderId)
          );

          return (
            <Menu style={styles.menu} key={message.id}>
              <MenuTrigger onPress={() => handlePressMessage(message.id)}>
                <View
                  ref={ref => messageRefs.current[message.id] = ref}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setMessageHeights(prev => ({
                      ...prev,
                      [message.id]: height
                    }));
                  }}
                  style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.myMessage : styles.theirMessage,
                    highlightedMessageId === message.id && styles.highlightedMessage
                  ]}
                >
                  <View style={styles.messageInnerContainer}>
                    
                    {message.replyTo && (
                      <TouchableOpacity onPress={() => scrollToMessage(message.replyTo)}>
                        <View style={styles.replyContainer}>
                          <Text style={styles.replyText} numberOfLines={1}>
                            Replying to: {message.replyToText}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    {message.imageUrls && message.imageUrls.length > 0 && (
                      <TouchableOpacity onPress={() => {
                        setFullSizeImageUri(message.imageUrls[0]);
                        setFullSizeImageModalVisible(true);
                      }}>
                        <Image
                          source={{ uri: message.imageUrls[0] }}
                          style={styles.messageImage}
                        />
                      </TouchableOpacity>
                    )}

                    {message.fileUrl && (
                      <TouchableOpacity onPress={() => Linking.openURL(message.fileUrl)}>
                        <Text style={styles.fileText}>{message.fileName}</Text>
                      </TouchableOpacity>
                    )}
                    {message.type === 'file' && (
                      <TouchableOpacity
                        onPress={() => handleFileDownload(message.fileUrl, message.fileName)}
                        style={styles.fileContainer}
                        disabled={downloadingFiles.has(message.fileName)}
                      >
                        {downloadingFiles.has(message.fileName) ? (
                          <ActivityIndicator size="small" color="#4A4A4A" />
                        ) : (
                          <FontAwesomeIcon icon={faFile} size={24} color="#4A4A4A" />
                        )}
                        <Text style={styles.fileText}>{message.fileName}</Text>
                      </TouchableOpacity>
                    )}
                    
                    <Text style={styles.messageText}>{message.text}</Text>

                    <View style={styles.messageFooter}>
                      <Text style={[styles.messageDate, isCurrentUser && styles.messageDateMy]}>
                        {format(new Date(message.timestamp), 'H:mm', { locale })}
                      </Text>
                      {isCurrentUser && getStatusIcon(message.status)}
                    </View>
                  </View>

                  {isLastMessageFromUser && (
                    <View style={[
                      styles.triangle,
                      isCurrentUser ? styles.triangleMy : styles.triangleTheir
                    ]} />
                  )}
                </View>
              </MenuTrigger>

              <MenuOptions style={isCurrentUser ? styles.popupMenuPersonal : styles.popupMenuInterlocutor}>
                {isCurrentUser ? (
                  <>
                    <MenuOption value="reply" onSelect={() => handleReply(message)}>
                      <Text>Відповісти</Text>
                    </MenuOption>
                    <MenuOption value="copy" onSelect={() => handleCopyMessage(message)}>
                      <Text>Копіювати</Text>
                    </MenuOption>
                    <MenuOption value="attach" onSelect={() => handleAttachMessage(message)}>
                      <Text>Прикріпити</Text>
                    </MenuOption>
                    <MenuOption value="edit" onSelect={() => handleEditMessage(message)}>
                      <Text>Редагувати</Text>
                    </MenuOption>
                    <MenuOption value="delete" onSelect={() => {
                      setMessageToDelete(message);
                      setDeleteModalVisible(true);
                    }}>
                      <Text>Видалити</Text>
                    </MenuOption>
                  </>
                ) : (
                  <>
                    <MenuOption value="reply" onSelect={() => handleReply(message)}>
                      <Text>Відповісти</Text>
                    </MenuOption>
                    <MenuOption value="copy" onSelect={() => handleCopyMessage(message)}>
                      <Text>Копіювати</Text>
                    </MenuOption>
                    <MenuOption value="attach" onSelect={() => handleAttachMessage(message)}>
                      <Text>Прикріпити</Text>
                    </MenuOption>
                    <MenuOption value="translate" onSelect={() => handleMenuOptionSelect('translate')}>
                      <Text>Перекласти</Text>
                    </MenuOption>
                  </>
                )}
              </MenuOptions>
            </Menu>
          );
        })}
    </View>
  );

  return (
    <View style={styles.container}>
      {attachedMessage && (
        <TouchableOpacity onPress={() => scrollToMessage(attachedMessage.id)}>
          <View style={styles.attachedMessageContainer}>
            <Text style={styles.attachedMessageText} numberOfLines={1}>
              Attached: {attachedMessageText}
            </Text>
            <TouchableOpacity onPress={async () => {
              try {
                const db = getDatabase();
                const pinnedMessageRef = ref(db, `guilds/${guildId}/chats/${chatId}/pinnedMessage`);
                await set(pinnedMessageRef, null);

                setAttachedMessage(null);
                setAttachedMessageText('');
              } catch (error) {
                console.error("Error unpinning message:", error);
              }
            }}>
              <Text style={styles.cancelAttachedText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      <FlatList
        ref={flatListRef}
        data={messages.length > 0 ? messages : []}
        renderItem={renderItem}
        keyExtractor={(item) => item.date + item.messages[0].id}
        style={styles.messagesList}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
      {replyToMessage && (
        <View style={styles.replyingToContainer}>
          <Text style={styles.replyingToText} numberOfLines={1}>
            Replying to: {replyToMessageText}
          </Text>
          <TouchableOpacity onPress={() => {
            setReplyToMessage(null);
            setReplyToMessageText('');
          }}>
            <Text style={styles.cancelReplyText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { height: inputHeight }]}
            value={editMessage ? editMessageText : newMessage}
            onChangeText={editMessage ? setEditMessageText : setNewMessage}
            onContentSizeChange={handleContentSizeChange}
            multiline
            placeholder="Write a message..."
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (editMessage) {
                saveEditedMessage();
              } else if (newMessage.trim()) {
                handleSendMessage();
              } else {
                Alert.alert(
                  "Виберіть дію",
                  "",
                  [
                    { text: "Зображення", onPress: selectImage },
                    { text: "Файл", onPress: selectFile },
                    { text: "Скасувати", style: "cancel" }
                  ]
                );
              }
            }}
          >
            <FontAwesomeIcon
              icon={editMessage || newMessage.trim() ? faPaperPlane : faPaperclip}
              size={24}
              style={editMessage || newMessage.trim() ? styles.blueIcon : styles.defaultIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={captionModalVisible}
        onRequestClose={() => setCaptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Add a Caption</Text>
            <TextInput
              style={styles.imageTextInput}
              value={imageCaption}
              onChangeText={setImageCaption}
              placeholder="Enter a caption..."
            />
            <TouchableOpacity
              style={styles.buttonSendPhoto}
              onPress={uploadImageAndSaveMessage}
            >
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancelPhoto}
              onPress={() => setCaptionModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={fullSizeImageModalVisible}
        onRequestClose={() => setFullSizeImageModalVisible(false)}
      >
        <View style={styles.fullSizeImageModalOverlay}>
          <TouchableOpacity
            style={styles.fullSizeImageModalContainer}
            onPress={() => setFullSizeImageModalVisible(false)}
          >
            <Image
              source={{ uri: fullSizeImageUri }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Переклад</Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.translatedText}>{translatedText}</Text>
            </ScrollView>
            <Button title="Закрити" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Delete Message</Text>
            <View style={styles.modalButtonContainer}>
              <View style={{ margin: 5 }}>
                <Button title="Delete for Both" onPress={() => handleDeleteMessage(true)} />
              </View>
              <View style={{ margin: 5 }}>
                <Button title="Delete for Myself" onPress={() => handleDeleteMessage(false)} />
              </View>
              <View style={{ margin: 5 }}>
                <Button title="Cancel" onPress={() => setDeleteModalVisible(false)} />
              </View>
            </View>
          </View>
        </View >
      </Modal >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  dateGroup: {
    marginBottom: 10,
  },
  dateBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  date: {
    fontSize: 14,
    color: "#fff",
    backgroundColor: "#999",
    padding: 5,
    borderRadius: 10,
  },

  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    minWidth: screenWidth / 2, // Мінімальна ширина повідомлення
    position: 'relative', // Необхідно для позиціонування "хвостиків"
  },
  messageInnerContainer: {
    padding: 2,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ECECEC",
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  blueIcon: {
    color: "#007bff",
  },
  defaultIcon: {
    color: "#ccc",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  triangle: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    position: 'absolute',
  },
  triangleMy: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "#DCF8C6",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    bottom: -25,
    right: -15,
  },
  triangleTheir: {
    borderTopWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 25,
    borderLeftWidth: 25,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#ECECEC",
    bottom: -25,
    left: -15,
  },
  messageDateMy: {
    alignSelf: 'flex-end', // Вирівнювання по правому краю
    marginTop: 4, // Можна додати додатковий відступ для відокремлення часу від тексту
    color: '#aaa', // Можна налаштувати колір часу
  },
  menu: {
    position: 'relative',

    //bottom: 50, // Можна змінити для відповідності з вашим дизайном

  },
  popupMenuInterlocutor: {

    position: 'absolute',
    left: 10,  // Відступ зліва для співрозмовника
    top: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі
  },
  // Стиль для попап меню особистих повідомлень
  popupMenuPersonal: {
    backgroundColor: 'red',
    position: 'absolute',
    right: -155,  // Відступ справа для особистих повідомлень
    top: 0,
    fontSize: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    // Інші стилі, такі ж як для співрозмовника
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%', // Модальне вікно займає не більше половини екрану
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContent: {
    paddingVertical: 10,
  },
  translatedText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageTextInput: {
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    width: '100%',
    marginBottom: 20,
  },
  buttonSendPhoto: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonCancelPhoto: {
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  fullSizeImageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  fullSizeImageModalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
  },
  replyContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
    marginBottom: 5,
  },
  replyText: {
    fontStyle: 'italic',
    color: '#666',
    overflow: 'hidden',
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  replyingToText: {
    flex: 1,
    fontStyle: 'italic',
    color: '#666',
  },
  cancelReplyText: {
    color: '#007bff',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'column',
    width: '100%',

    marginVertical: 5,
  },
  buttonWrapper: {
    marginBottom: 10,
    width: '100%',
  },
  attachedMessageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  attachedMessageText: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  cancelAttachedText: {
    color: '#007AFF',
    marginLeft: 10
  },
  highlightedMessage: {
    backgroundColor: '#2296f3',
    borderWidth: 1,
    borderColor: '#2296f3',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 5
  },
  fileName: {
    marginLeft: 10,
    color: '#007AFF',
    textDecorationLine: 'underline'
  },
  doubleCheckContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    color: '#8e8e8e',
  },
  secondCheck: {
    marginLeft: -8,
  },
});

export default ChatWindow;