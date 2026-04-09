import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMBNAIL_SIZE = (SCREEN_WIDTH - 60) / 3; // 3 thumbnails per row with spacing

/**
 * MediaPreview Component
 * Displays a grid of media thumbnails with zoom viewer and delete options
 * 
 * @param {Array} media - Array of media objects {uri, width, height, type}
 * @param {Function} onDelete - Callback when media is deleted (index)
 * @param {boolean} editable - Whether user can delete media
 * @param {number} maxItems - Maximum number of items to display
 */
const MediaPreview = ({ media = [], onDelete, editable = true, maxItems = 5 }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  // Handle thumbnail press - open zoom viewer
  const handleThumbnailPress = (index) => {
    setSelectedIndex(index);
  };

  // Close zoom viewer
  const handleCloseViewer = () => {
    setSelectedIndex(null);
  };

  // Handle delete
  const handleDelete = (index) => {
    if (onDelete) {
      onDelete(index);
    }
    // Close viewer if deleting current image
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  };

  // Handle image load start
  const handleLoadStart = (index) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
  };

  // Handle image load end
  const handleLoadEnd = (index) => {
    setLoadingStates(prev => ({ ...prev, [index]: false }));
  };

  // Render empty state
  if (!media || media.length === 0) {
    return null;
  }

  // Limit to maxItems
  const displayMedia = media.slice(0, maxItems);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Photos ({displayMedia.length}/{maxItems})
        </Text>
        {displayMedia.length === maxItems && (
          <Text style={styles.limitText}>Maximum reached</Text>
        )}
      </View>

      {/* Thumbnail Grid */}
      <View style={styles.grid}>
        {displayMedia.map((item, index) => (
          <View key={index} style={styles.thumbnailContainer}>
            <TouchableOpacity
              onPress={() => handleThumbnailPress(index)}
              style={styles.thumbnailTouchable}
              activeOpacity={0.7}
            >
              {/* Loading indicator */}
              {loadingStates[index] && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color="#2196F3" />
                </View>
              )}

              {/* Thumbnail image */}
              <Image
                source={{ uri: item.uri }}
                style={styles.thumbnail}
                resizeMode="cover"
                onLoadStart={() => handleLoadStart(index)}
                onLoadEnd={() => handleLoadEnd(index)}
              />

              {/* Delete button */}
              {editable && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Image Viewer Modal */}
      {selectedIndex !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseViewer}
        >
          <View style={styles.modalContainer}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseViewer}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {/* Image counter */}
            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {selectedIndex + 1} / {displayMedia.length}
              </Text>
            </View>

            {/* Scrollable image viewer */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: selectedIndex * SCREEN_WIDTH, y: 0 }}
              style={styles.imageScrollView}
            >
              {displayMedia.map((item, index) => (
                <View key={index} style={styles.imageViewerContainer}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Delete button in viewer */}
            {editable && (
              <TouchableOpacity
                style={styles.viewerDeleteButton}
                onPress={() => handleDelete(selectedIndex)}
              >
                <Text style={styles.viewerDeleteText}>Delete Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  limitText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    margin: 4,
  },
  thumbnailTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  deleteIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  counterContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 100,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageScrollView: {
    flex: 1,
  },
  imageViewerContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 200, // Leave space for buttons
  },
  viewerDeleteButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  viewerDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MediaPreview;
