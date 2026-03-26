/**
 * EditProfileScreen.js
 * Issue #46 — W5: User Profile Screen — Frontend
 *
 * Editable fields: first name, last name, email (read-only), phone (optional), bio (optional)
 * Profile image upload via imagePicker.js with cropping
 * Connected to PUT /api/v1/users/profile
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authService } from '../services/authService';
import { selectFromGallery, takePhoto } from '../services/imagePicker';
import apiClient from '../services/api';

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    profileImageUrl: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      let user = null;
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          user = response.data.data.user;
        }
      } catch (_) {
        user = await authService.getCachedUser();
      }

      if (user) {
        setFormData({
          firstName:       user.first_name  || user.firstName  || '',
          lastName:        user.last_name   || user.lastName   || '',
          email:           user.email       || '',
          phoneNumber:     user.phone_number || user.phoneNumber || '',
          bio:             user.bio         || '',
          profileImageUrl: user.profile_image_url || user.profileImageUrl || null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]{7,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = () => {
    Alert.alert('Profile Photo', 'Choose a source', [
      {
        text: 'Camera',
        onPress: async () => {
          const image = await takePhoto({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
          if (image) updateField('profileImageUrl', image.uri);
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const images = await selectFromGallery({
            allowsMultipleSelection: false,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (images && images.length > 0) updateField('profileImageUrl', images[0].uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const result = await authService.updateFullProfile({
        first_name:        formData.firstName.trim(),
        last_name:         formData.lastName.trim(),
        phone_number:      formData.phoneNumber.trim() || undefined,
        bio:               formData.bio.trim() || undefined,
        profile_image_url: formData.profileImageUrl || undefined,
      });

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Edit Your Profile</Text>

          {/* ── Profile Image ── */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} disabled={saving}>
              {formData.profileImageUrl ? (
                <Image source={{ uri: formData.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {(formData.firstName[0] || '') + (formData.lastName[0] || '')}
                  </Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change photo</Text>
          </View>

          {/* ── First Name ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(v) => updateField('firstName', v)}
              editable={!saving}
              placeholderTextColor="#ccc"
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>

          {/* ── Last Name ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(v) => updateField('lastName', v)}
              editable={!saving}
              placeholderTextColor="#ccc"
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>

          {/* ── Email (read-only) ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputReadOnly]}
              value={formData.email}
              editable={false}
              placeholderTextColor="#ccc"
            />
            <Text style={styles.hintText}>Email cannot be changed</Text>
          </View>

          {/* ── Phone ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="e.g., (555) 123-4567"
              value={formData.phoneNumber}
              onChangeText={(v) => updateField('phoneNumber', v)}
              keyboardType="phone-pad"
              editable={!saving}
              placeholderTextColor="#ccc"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {/* ── Bio ── */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio (Optional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell others a bit about yourself…"
              value={formData.bio}
              onChangeText={(v) => updateField('bio', v)}
              multiline
              numberOfLines={4}
              maxLength={300}
              editable={!saving}
              placeholderTextColor="#ccc"
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{formData.bio.length}/300</Text>
          </View>

          <View style={styles.spacer} />

          {/* ── Action Buttons ── */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f8f9fa' },
  flex:             { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content:          { padding: 20, paddingBottom: 40 },

  sectionTitle: { fontSize: 24, fontWeight: '600', color: '#1a1a1a', marginBottom: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#007AFF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitials: { fontSize: 32, fontWeight: '700', color: '#fff' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#007AFF', borderRadius: 14,
    width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#f8f9fa',
  },
  avatarEditIcon: { fontSize: 13 },
  avatarHint: { fontSize: 12, color: '#888', marginTop: 6 },

  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },

  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#1a1a1a',
  },
  inputError:    { borderColor: '#ff3b30' },
  inputReadOnly: { backgroundColor: '#f0f0f0', color: '#888' },
  bioInput:      { minHeight: 100, paddingTop: 12 },

  errorText: { color: '#ff3b30', fontSize: 12, marginTop: 4 },
  hintText:  { color: '#888',    fontSize: 12, marginTop: 4 },
  charCount: { color: '#aaa',    fontSize: 12, marginTop: 4, textAlign: 'right' },

  spacer: { height: 20 },

  buttonContainer: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8,
    padding: 14, alignItems: 'center', justifyContent: 'center',
  },
  cancelButtonText: { color: '#333', fontSize: 16, fontWeight: '600' },
  saveButton: {
    flex: 1, backgroundColor: '#007AFF', borderRadius: 8,
    padding: 14, alignItems: 'center', justifyContent: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#a0c4ff' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default EditProfileScreen;
