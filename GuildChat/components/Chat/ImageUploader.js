import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const ImageUploader = ({ onUploadComplete }) => {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const selectImage = () => {
    const options = { mediaType: 'photo', quality: 1 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setImageUri(response.assets[0].uri);
      }
    });
  };

  const uploadImage = async () => {
    if (!imageUri) return;

    setUploading(true);
    const fileName = imageUri.substring(imageUri.lastIndexOf('/') + 1);
    const reference = storage().ref(`/chatImages/${fileName}`);
    
    try {
      await reference.putFile(imageUri);
      const url = await reference.getDownloadURL();
      setImageUrl(url);
      setUploading(false);

      // Викликаємо callback для повернення URL в батьківський компонент
      if (onUploadComplete) onUploadComplete(url);
    } catch (error) {
      console.error('Image upload error: ', error);
      setUploading(false);
    }
  };

  return (
    <View>
      <Button title="Вибрати зображення" onPress={selectImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100 }} />}
      <Button title="Завантажити зображення" onPress={uploadImage} disabled={uploading || !imageUri} />
      {uploading && <Text>Завантаження...</Text>}
      {imageUrl && <Text>Зображення успішно завантажено!</Text>}
    </View>
  );
};

export default ImageUploader;
