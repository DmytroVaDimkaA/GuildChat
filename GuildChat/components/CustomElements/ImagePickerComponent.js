import React, { useState } from 'react';
import { View, TextInput, Image, ScrollView, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CustomImagePicker = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [description, setDescription] = useState('');

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Доступ до медіатеки не надано.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Дозволяє вибирати кілька зображень
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages([...selectedImages, ...newImages]); // Додаємо вибрані зображення в масив
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Поле для вводу тексту */}
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Додати опис..."
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          width: '100%',
          borderRadius: 5,
          marginBottom: 20,
        }}
      />

      {/* Кнопка для відкриття галереї */}
      <TouchableOpacity
        onPress={pickImages}
        style={{
          backgroundColor: '#007bff',
          padding: 10,
          borderRadius: 5,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: '#fff' }}>Вибрати зображення</Text>
      </TouchableOpacity>

      {/* Відображення вибраних зображень */}
      <ScrollView horizontal style={{ marginTop: 20 }}>
        {selectedImages.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={{ width: 100, height: 100, marginRight: 10 }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default CustomImagePicker;
