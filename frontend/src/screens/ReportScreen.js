import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import api from '../services/api';
import { authService } from '../services/authService';
import { getAccessToken } from '../utils/secureStorage';
import { getLocationWithAddress } from '../services/locationService';
import MediaPreview from '../components/MediaPreview';
import { showImagePickerOptions, validateImages } from '../services/imagePicker';
import { compressAndUpload, cleanupCompressedImages } from '../services/imageCompression';
import { enqueueSubmission } from '../utils/offlineQueue';

const ReportScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ stage: '', percentage: 0 });
  const [currentUser, setCurrentUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      authService.getCachedUser().then(setCurrentUser);
    }, [])
  );

  const incidentTypes = [
    { id: 'theft', label: 'Theft', icon: '🚨', description: 'Stolen items or break-ins' },
    { id: 'vandalism', label: 'Vandalism', icon: '🔨', description: 'Property damage' },
    { id: 'assault', label: 'Assault', icon: '⚠️', description: 'Physical violence' },
    { id: 'suspicious_activity', label: 'Suspicious', icon: '👀', description: 'Unusual behavior' },
    { id: 'traffic_violation', label: 'Traffic', icon: '🚗', description: 'Reckless driving' },
    { id: 'noise_complaint', label: 'Noise', icon: '🔊', description: 'Loud disturbances' },
    { id: 'fire', label: 'Fire', icon: '🔥', description: 'Fire or smoke' },
    { id: 'medical_emergency', label: 'Medical', icon: '🚑', description: 'Medical emergency' },
    { id: 'other', label: 'Other', icon: '📌', description: 'Other incidents' },
  ];

  const priorityLevels = [
    { id: 'low', label: 'Low', color: '#4CAF50' },
    { id: 'medium', label: 'Medium', color: '#FFC107' },
    { id: 'high', label: 'High', color: '#FF9800' },
    { id: 'urgent', label: 'Urgent', color: '#F44336' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const result = await getLocationWithAddress();

      if (result) {
        setLocation({ latitude: result.latitude, longitude: result.longitude });
        if (result.address) setAddress(result.address);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddImages = async () => {
    // Check if already at max limit
    if (selectedImages.length >= 5) {
      Alert.alert('Maximum Reached', 'You can only add up to 5 photos per report.');
      return;
    }

    try {
      // Show picker options (camera or gallery)
      const pickedImages = await showImagePickerOptions({
        allowsMultipleSelection: true,
        selectionLimit: 5 - selectedImages.length,
        quality: 0.9,
      });

      if (pickedImages && pickedImages.length > 0) {
        // Validate images
        const validation = validateImages(pickedImages);
        if (!validation.valid) {
          Alert.alert('Invalid Images', validation.errors.join('\n'));
          return;
        }

        // Add to selected images
        setSelectedImages(prev => [...prev, ...pickedImages]);
      }
    } catch (error) {
      console.error('Error adding images:', error);
      Alert.alert('Error', 'Failed to add images. Please try again.');
    }
  };

  const handleDeleteImage = (index) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSelectedImages(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (description.trim().length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    // Incident type validation
    if (!incidentType) {
      newErrors.incidentType = 'Please select an incident type';
    }

    // Location validation
    if (!location) {
      newErrors.location = 'Location is required. Please enable location services.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again.');
      return;
    }

    try {
      setLoading(true);

      // Prepare report data
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        incident_type: incidentType,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address.trim() || null,
        incident_date: new Date().toISOString(),
        priority: priority,
      };

      // Submit report to API
      const response = await api.post('/reports', reportData);

      if (response.data.success) {
        const reportId = response.data.data.id;

        // Upload images if any are selected
        if (selectedImages.length > 0) {
          try {
            setUploadProgress({ stage: 'compress', percentage: 0 });

            // Get auth token for upload
            const token = await getAccessToken();
            const uploadUrl = `${api.defaults.baseURL}/reports/${reportId}/media`;

            // Compress and upload images
            const uploadResult = await compressAndUpload(
              selectedImages,
              uploadUrl,
              {
                compression: { preset: 'upload' },
                upload: {
                  fieldName: 'media',
                  headers: { Authorization: `Bearer ${token}` },
                  maxRetries: 3,
                },
              },
              (progress) => {
                setUploadProgress(progress);
              }
            );

            // Clean up compressed images
            await cleanupCompressedImages(uploadResult.compressed);

            // Show warning if some uploads failed
            if (uploadResult.failureCount > 0) {
              Alert.alert(
                'Partial Upload',
                `Report submitted, but ${uploadResult.failureCount} photo(s) failed to upload. You can add them later.`,
                [
                  {
                    text: 'View Report',
                    onPress: () => navigation.navigate('Home'),
                  },
                ]
              );
              setLoading(false);
              setUploadProgress({ stage: '', percentage: 0 });
              return;
            }
          } catch (uploadError) {
            console.error('Error uploading images:', uploadError);
            Alert.alert(
              'Upload Warning',
              'Your report was submitted successfully, but photos could not be uploaded. You can add them later.',
              [
                {
                  text: 'View Report',
                  onPress: () => navigation.navigate('Home'),
                },
              ]
            );
            setLoading(false);
            setUploadProgress({ stage: '', percentage: 0 });
            return;
          }
        }

        setLoading(false);
        setUploadProgress({ stage: '', percentage: 0 });

        Alert.alert(
          'Success! 🎉',
          'Your report has been submitted successfully. Our team will review it shortly.',
          [
            {
              text: 'View My Reports',
              onPress: () => navigation.navigate('Home'),
            },
            {
              text: 'Submit Another',
              onPress: () => resetForm(),
              style: 'cancel',
            },
          ]
        );
      } else {
        setLoading(false);
        setUploadProgress({ stage: '', percentage: 0 });
        Alert.alert(
          'Submission Error',
          response.data.message || 'The report could not be submitted. Please try again.'
        );
      }
    } catch (error) {
      setLoading(false);
      setUploadProgress({ stage: '', percentage: 0 });
      console.error('Error submitting report:', error);

      // If network appears offline, queue for later submission
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        const reportData = {
          title: title.trim(),
          description: description.trim(),
          incident_type: incidentType,
          latitude: location.latitude,
          longitude: location.longitude,
          address: address.trim() || null,
          incident_date: new Date().toISOString(),
          priority: priority,
        };
        await enqueueSubmission(reportData);
        Alert.alert(
          'Saved Offline',
          'No network connection. Your report has been saved and will be submitted automatically when you reconnect.',
          [{ text: 'OK', onPress: () => resetForm() }]
        );
        return;
      }

      let errorMessage = 'An error occurred while submitting your report. Please try again.';
      
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details;
        errorMessage = validationErrors.map(e => e.message).join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert('Submission Error', errorMessage);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIncidentType('');
    setPriority('medium');
    setErrors({});
    setSelectedImages([]);
    getCurrentLocation();
  };

  const renderError = (field) => {
    if (errors[field]) {
      return <Text style={styles.errorText}>⚠️ {errors[field]}</Text>;
    }
    return null;
  };

  const renderCharacterCount = (current, max) => {
    const isNearLimit = current > max * 0.8;
    return (
      <Text style={[styles.charCount, isNearLimit && styles.charCountWarning]}>
        {current}/{max}
      </Text>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentUser && !currentUser.isVerified ? (
        <View style={styles.pendingWall}>
          <Text style={styles.pendingIcon}>⏳</Text>
          <Text style={styles.pendingTitle}>Account Pending Verification</Text>
          <Text style={styles.pendingBody}>
            Your account is awaiting admin approval. Once verified, you will be able to submit incident reports.
          </Text>
          <Text style={styles.pendingHint}>
            In the meantime, you can browse reports and view alerts.
          </Text>
        </View>
      ) : (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Submit a Report</Text>
            <Text style={styles.headerSubtitle}>Help keep your community safe</Text>
          </View>

          {/* Emergency Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerIcon}>🚨</Text>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>In an emergency, call 911 immediately.</Text>
              {' '}This form is for non-emergency reports only and is not monitored in real time.
            </Text>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>📍 Location</Text>
              {locationLoading && (
                <ActivityIndicator size="small" color="#2196F3" />
              )}
            </View>
            
            {location ? (
              <View style={styles.locationCard}>
                <Text style={styles.locationText}>
                  {address || 'Location acquired'}
                </Text>
                <TouchableOpacity onPress={getCurrentLocation}>
                  <Text style={styles.refreshText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.locationButton} 
                onPress={getCurrentLocation}
                disabled={locationLoading}
              >
                <Text style={styles.locationButtonText}>
                  {locationLoading ? 'Getting location...' : 'Get Current Location'}
                </Text>
              </TouchableOpacity>
            )}
            {renderError('location')}
          </View>

          {/* Incident Type Section */}
          <View style={styles.section}>
            <Text style={styles.label}>🚨 Incident Type *</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {incidentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    incidentType === type.id && styles.typeCardSelected,
                  ]}
                  onPress={() => {
                    setIncidentType(type.id);
                    setErrors({ ...errors, incidentType: null });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    incidentType === type.id && styles.typeLabelSelected,
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {renderError('incidentType')}
          </View>

          {/* Priority Section */}
          <View style={styles.section}>
            <Text style={styles.label}>⚡ Priority Level</Text>
            <View style={styles.priorityRow}>
              {priorityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.priorityButton,
                    priority === level.id && { 
                      backgroundColor: level.color,
                      borderColor: level.color,
                    },
                  ]}
                  onPress={() => setPriority(level.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === level.id && styles.priorityTextSelected,
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>📝 Title *</Text>
              {renderCharacterCount(title.length, 255)}
            </View>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="Brief summary (e.g., Suspicious vehicle in driveway)"
              placeholderTextColor="#999"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors({ ...errors, title: null });
              }}
              maxLength={255}
            />
            {renderError('title')}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>📄 Description *</Text>
              {renderCharacterCount(description.length, 5000)}
            </View>
            <TextInput
              style={[styles.input, styles.textArea, errors.description && styles.inputError]}
              placeholder="Provide detailed information about the incident, including what happened, when, and any other relevant details..."
              placeholderTextColor="#999"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setErrors({ ...errors, description: null });
              }}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={5000}
            />
            {renderError('description')}
          </View>

          {/* Media Section */}
          <View style={styles.section}>
            <Text style={styles.label}>📷 Photos (Optional)</Text>
            <Text style={styles.helperText}>Add up to 5 photos to support your report</Text>
            
            {/* Show selected images */}
            {selectedImages.length > 0 && (
              <MediaPreview 
                media={selectedImages}
                onDelete={handleDeleteImage}
                editable={!loading}
                maxItems={5}
              />
            )}

            {/* Add photos button */}
            {selectedImages.length < 5 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddImages}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.addPhotoIcon}>📸</Text>
                <Text style={styles.addPhotoText}>
                  {selectedImages.length === 0 ? 'Add Photos' : 'Add More Photos'}
                </Text>
                <Text style={styles.addPhotoSubtext}>
                  {5 - selectedImages.length} remaining
                </Text>
              </TouchableOpacity>
            )}

            {/* Upload progress */}
            {uploadProgress.percentage > 0 && (
              <View style={styles.uploadProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${uploadProgress.percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {uploadProgress.stage === 'compress' ? '📦 Compressing...' : '☁️ Uploading...'}
                  {' '}{uploadProgress.percentage}%
                </Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>📤 Submit Report</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              * Required fields • All reports are reviewed within 24 hours
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  pendingWall: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  pendingIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  pendingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  pendingBody: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  pendingHint: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#7D4E00',
    lineHeight: 19,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: '#7D4E00',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  charCountWarning: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginRight: 12,
  },
  refreshText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  typeScroll: {
    marginHorizontal: -4,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 110,
  },
  typeCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#EFF6FF',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: '#2196F3',
    fontWeight: '700',
  },
  typeDescription: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priorityTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  textArea: {
    minHeight: 140,
    paddingTop: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  addPhotoButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  addPhotoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  addPhotoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addPhotoSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  uploadProgress: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ReportScreen;

