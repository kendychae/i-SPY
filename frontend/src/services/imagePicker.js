import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Image Picker Service
 * Handles camera and gallery image selection with permission management
 */

/**
 * Request camera permissions
 * @returns {Promise<boolean>} Permission granted status
 */
export const requestCameraPermission = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request media library permissions
 * @returns {Promise<boolean>} Permission granted status
 */
export const requestMediaLibraryPermission = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Photo Library Permission Required',
        'Please enable photo library access in your device settings to select photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Launch camera to take a photo
 * @param {Object} options - Camera options
 * @returns {Promise<Object|null>} Image result or null if cancelled
 */
export const takePhoto = async (options = {}) => {
  try {
    // Request permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    // Default options
    const cameraOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing !== false, // Default true
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8, // 0-1, default 0.8
      ...options,
    };

    // Launch camera
    const result = await ImagePicker.launchCameraAsync(cameraOptions);

    if (result.canceled) {
      return null;
    }

    // Return first image (camera only takes one)
    return result.assets[0];

  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Camera Error', 'An error occurred while accessing the camera.');
    return null;
  }
};

/**
 * Launch photo library to select images
 * @param {Object} options - Selection options
 * @returns {Promise<Array|null>} Array of selected images or null if cancelled
 */
export const selectFromGallery = async (options = {}) => {
  try {
    // Request permission
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return null;
    }

    // Default options
    const galleryOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: options.allowsMultipleSelection !== false, // Default true
      selectionLimit: options.selectionLimit || 5, // Max 5 images
      allowsEditing: !options.allowsMultipleSelection, // Only edit if single selection
      aspect: options.aspect || [4, 3],
      quality: options.quality || 0.8, // 0-1, default 0.8
      ...options,
    };

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync(galleryOptions);

    if (result.canceled) {
      return null;
    }

    // Return selected images
    return result.assets;

  } catch (error) {
    console.error('Error selecting from gallery:', error);
    Alert.alert('Gallery Error', 'An error occurred while accessing the photo library.');
    return null;
  }
};

/**
 * Show action sheet to choose between camera and gallery
 * @param {Object} options - Picker options
 * @returns {Promise<Array|null>} Selected images or null
 */
export const showImagePickerOptions = (options = {}) => {
  return new Promise((resolve) => {
    Alert.alert(
      options.title || 'Add Photo',
      options.message || 'Choose a photo from your library or take a new one',
      [
        {
          text: '📷 Take Photo',
          onPress: async () => {
            const photo = await takePhoto(options);
            resolve(photo ? [photo] : null);
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const photos = await selectFromGallery(options);
            resolve(photos);
          },
        },
        {
          text: 'Cancel',
          onPress: () => resolve(null),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  });
};

/**
 * Validate image file
 * @param {Object} image - Image object from picker
 * @returns {Object} Validation result {valid: boolean, error: string}
 */
export const validateImage = (image) => {
  const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  // Check file size
  if (image.fileSize && image.fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: 'Image size exceeds 10 MB limit. Please choose a smaller image or compress it.',
    };
  }

  // Check file type
  if (image.type && !allowedTypes.includes(image.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Only JPEG and PNG are supported.',
    };
  }

  // Check dimensions (optional)
  const maxDimension = 4096;
  if (image.width > maxDimension || image.height > maxDimension) {
    return {
      valid: false,
      error: `Image dimensions exceed maximum (${maxDimension}x${maxDimension}). Please select a smaller image.`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Batch validate multiple images
 * @param {Array} images - Array of image objects
 * @returns {Object} Validation result {valid: boolean, errors: Array}
 */
export const validateImages = (images) => {
  const maxImages = 5;
  const errors = [];

  // Check count
  if (images.length > maxImages) {
    errors.push(`Maximum ${maxImages} images allowed per report.`);
  }

  // Validate each image
  images.forEach((image, index) => {
    const validation = validateImage(image);
    if (!validation.valid) {
      errors.push(`Image ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get image file info
 * @param {Object} image - Image object from picker
 * @returns {Object} Image information
 */
export const getImageInfo = (image) => {
  return {
    uri: image.uri,
    width: image.width,
    height: image.height,
    type: image.type || 'image/jpeg',
    fileSize: image.fileSize,
    fileName: image.fileName || `image_${Date.now()}.jpg`,
  };
};

export default {
  requestCameraPermission,
  requestMediaLibraryPermission,
  takePhoto,
  selectFromGallery,
  showImagePickerOptions,
  validateImage,
  validateImages,
  getImageInfo,
};
