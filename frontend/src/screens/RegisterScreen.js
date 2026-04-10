import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../services/authService';
import apiClient from '../services/api';
import { validateRegister } from '../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: 'citizen',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idImage, setIdImage] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePickIdImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Please allow photo library access to upload your ID.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        setIdImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to pick image. Please try again.');
    }
  };

  /**
   * Compress an image URI to a Blob under maxBytes using a canvas (web only).
   * Iteratively lowers JPEG quality until the file fits.
   */
  const compressImageWeb = (uri, maxBytes = 4 * 1024 * 1024) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
          else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        let quality = 0.7;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Canvas compression failed')); return; }
            if (blob.size <= maxBytes || quality <= 0.2) { resolve(blob); return; }
            quality -= 0.1;
            tryCompress();
          }, 'image/jpeg', quality);
        };
        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = uri;
    });

  const uploadIdDocument = async () => {
    if (!idImage?.uri) {
      throw new Error('Please upload an ID image before creating your account.');
    }

    const formDataUpload = new FormData();
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB target

    if (Platform.OS === 'web') {
      const blob = await compressImageWeb(idImage.uri, MAX_SIZE);
      const filename = idImage.fileName || `id-${Date.now()}.jpg`;
      formDataUpload.append('idDocument', blob, filename);
    } else {
      // Re-pick at lower quality if the file is large
      let uri = idImage.uri;
      if ((idImage.fileSize || 0) > MAX_SIZE) {
        const recompressed = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.4,
        });
        if (!recompressed.canceled && recompressed.assets?.length) {
          uri = recompressed.assets[0].uri;
        }
      }
      formDataUpload.append('idDocument', {
        uri,
        name: idImage.fileName || `id-${Date.now()}.jpg`,
        type: idImage.mimeType || 'image/jpeg',
      });
    }

    const uploadResponse = await apiClient.post('/auth/upload-id', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!uploadResponse.data?.success || !uploadResponse.data?.data?.idDocumentUrl) {
      throw new Error(uploadResponse.data?.message || 'Failed to upload ID document.');
    }

    return uploadResponse.data.data.idDocumentUrl;
  };

  const handleRegister = async () => {
    const { valid, errors: validationErrors } = validateRegister(formData);

    if (!valid) {
      setErrors(validationErrors);
      setStatusMessage('Please fix the highlighted fields');
      setStatusType('error');
      Alert.alert('Error', 'Please fix the highlighted fields');
      return;
    }

    if (!['citizen', 'officer'].includes(formData.userType)) {
      setStatusMessage('Please choose account type: Citizen or Officer.');
      setStatusType('error');
      Alert.alert('Error', 'Please choose account type: Citizen or Officer.');
      return;
    }

    if (!idImage?.uri) {
      setStatusMessage('Please upload an image of your ID.');
      setStatusType('error');
      Alert.alert('ID Required', 'Please upload an image of your ID before creating an account.');
      return;
    }

    setStatusMessage('Creating account...');
    setStatusType('loading');
    setLoading(true);

    try {
      const idDocumentUrl = await uploadIdDocument();

      const result = await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        userType: formData.userType,
        idDocumentUrl,
      });

      if (result.success) {
        setStatusMessage('Account submitted for admin verification. You can log in after approval.');
        setStatusType('success');
        Alert.alert('Account Submitted', 'Your account is pending admin verification. Please log in after approval.', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        setStatusMessage(result.message || 'Unable to create account');
        setStatusType('error');
        if (result.errors) {
          const errorMessages = result.errors.map(e => e.message).join('\n');
          Alert.alert('Registration Failed', errorMessages);
        } else {
          Alert.alert('Registration Failed', result.message || 'Unable to create account');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the VIGILUX community</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="First Name *"
            placeholderTextColor="#999"
            value={formData.firstName}
            onChangeText={(value) => updateField('firstName', value)}
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="Last Name *"
            placeholderTextColor="#999"
            value={formData.lastName}
            onChangeText={(value) => updateField('lastName', value)}
            autoCapitalize="words"
            editable={!loading}
          />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email *"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Phone Number (optional)"
            placeholderTextColor="#999"
            value={formData.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <Text style={styles.sectionLabel}>Account Type *</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.userType === 'citizen' && styles.roleButtonActive,
              ]}
              onPress={() => updateField('userType', 'citizen')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formData.userType === 'citizen' && styles.roleButtonTextActive,
                ]}
              >
                Citizen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.userType === 'officer' && styles.roleButtonActive,
              ]}
              onPress={() => updateField('userType', 'officer')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.roleButtonText,
                  formData.userType === 'officer' && styles.roleButtonTextActive,
                ]}
              >
                Officer
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Upload ID Image *</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickIdImage}
            disabled={loading}
          >
            <Text style={styles.uploadButtonText}>
              {idImage?.fileName ? `Selected: ${idImage.fileName}` : 'Choose ID Image'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Required for admin verification before account access.</Text>

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError, { flex: 1 }]}
              placeholder="Password *"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword((p) => !p)}
              disabled={loading}
            >
              <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError, { flex: 1 }]}
              placeholder="Confirm Password *"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowConfirmPassword((p) => !p)}
              disabled={loading}
            >
              <Text style={styles.passwordToggleText}>{showConfirmPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

          {statusMessage ? (
            <Text
              style={
                statusType === 'error'
                  ? styles.statusError
                  : statusType === 'success'
                  ? styles.statusSuccess
                  : styles.statusNeutral
              }
            >
              {statusMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: -4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#e9f2ff',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: '#0056b3',
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadButtonText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadHint: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#d9534f',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordToggle: {
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  registerButtonDisabled: {
    backgroundColor: '#007AFF80',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    padding: 16,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#28a745',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusError: {
    color: '#d9534f',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusNeutral: {
    color: '#333',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#d9534f',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
  },
});

export default RegisterScreen;
