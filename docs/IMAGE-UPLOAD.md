# Image Upload Implementation Guide

Complete guide for the image picker, compression, and upload system in the VIGILUX mobile application.

## Architecture Overview

The image upload system consists of three main components:

1. **Image Picker Service** (`services/imagePicker.js`)
   - Camera and gallery access
   - Permission management
   - Image validation
   - Multi-image selection

2. **Image Compression Service** (`services/imageCompression.js`)
   - Client-side compression (60%+ reduction)
   - Multiple quality presets
   - Progress tracking
   - Batch processing
   - Retry logic on failure

3. **Media Preview Component** (`components/MediaPreview.js`)
   - Thumbnail grid display
   - Full-screen image viewer
   - Delete functionality
   - Loading states

## Features

### 📸 Image Picker

#### Camera Capture

- Direct camera access
- Real-time photo capture
- Automatic permission handling
- Edit before selection (crop, rotate)

#### Gallery Selection

- Multiple image selection (up to 5)
- Grid view with selection indicators
- Sort by date
- Album/folder browsing

#### Validation

- **File size**: Max 10 MB per image
- **Format**: JPEG, PNG only
- **Dimensions**: Max 4096x4096 pixels
- **Quantity**: Max 5 images per report

### 🗜️ Image Compression

#### Compression Presets

```javascript
COMPRESSION_TARGETS = {
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.7,
  },
  upload: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
  },
  highQuality: {
    maxWidth: 2560,
    maxHeight: 2560,
    quality: 0.85,
  },
};
```

#### Compression Benefits

- **60-80% size reduction** without visible quality loss
- **Faster uploads** - reduced bandwidth usage
- **Server cost savings** - less storage required
- **Better UX** - quicker submission process

#### Example Compression Results

```
Original: 4032x3024 @ 3.2 MB
↓
Compressed: 1920x1440 @ 640 KB (80% reduction)
```

### ☁️ Upload System

#### Features

- **Progress tracking** - Real-time percentage updates
- **Retry logic** - 3 automatic retries on failure
- **Exponential backoff** - 1s, 2s, 3s delays
- **Partial success** - Report submits even if some images fail
- **Cleanup** - Temporary compressed files removed after upload

#### Upload Flow

```
1. User selects images
   ↓
2. Validate images (size, format, count)
   ↓
3. Submit report (get report ID)
   ↓
4. Compress images (0-50% progress)
   ↓
5. Upload to /reports/:id/media (50-100% progress)
   ↓
6. Clean up temp files
   ↓
7. Show success/error message
```

## Implementation

### Using Image Picker Service

```javascript
import {
  showImagePickerOptions,
  validateImages,
} from '../services/imagePicker';

const handleAddPhotos = async () => {
  // Show picker with camera/gallery options
  const images = await showImagePickerOptions({
    allowsMultipleSelection: true,
    selectionLimit: 5,
    quality: 0.9,
  });

  if (images) {
    // Validate images
    const validation = validateImages(images);
    if (!validation.valid) {
      Alert.alert('Invalid Images', validation.errors.join('\n'));
      return;
    }

    // Images are valid, proceed
    setSelectedImages(images);
  }
};
```

### Using Compression Service

```javascript
import { compressAndUpload } from '../services/imageCompression';

const uploadImages = async (reportId) => {
  const uploadUrl = `${API_BASE}/reports/${reportId}/media`;

  const result = await compressAndUpload(
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
      // progress.stage: 'compress' or 'upload'
      // progress.percentage: 0-100
      setUploadProgress(progress);
    }
  );

  console.log(
    `Uploaded ${result.successCount} of ${selectedImages.length} images`
  );
};
```

### Using Media Preview Component

```javascript
import MediaPreview from '../components/MediaPreview';

<MediaPreview
  media={selectedImages}
  onDelete={(index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }}
  editable={!loading}
  maxItems={5}
/>;
```

## ReportScreen Integration

The report submission form includes the complete image upload workflow:

### UI Components

1. **Add Photos Button**
   - Dashed border style
   - Shows remaining photo count
   - Opens picker action sheet

2. **Media Preview Grid**
   - 3 thumbnails per row
   - Delete button on each
   - Tap to view full-screen

3. **Upload Progress Bar**
   - Shows during compression/upload
   - Displays stage and percentage
   - Blue progress fill animation

### User Flow

```
1. User taps "Add Photos"
   ↓
2. Action sheet: "Take Photo" or "Choose from Gallery"
   ↓
3. Select 1-5 photos
   ↓
4. Photos appear in grid
   ↓
5. Optionally delete unwanted photos
   ↓
6. Fill out report details
   ↓
7. Tap "Submit Report"
   ↓
8. Report created first
   ↓
9. Progress bar shows compression (0-50%)
   ↓
10. Progress bar shows upload (50-100%)
   ↓
11. Success message displayed
```

## Permissions

### iOS - Info.plist

```xml
<key>NSCameraUsageDescription</key>
<string>Allow VIGILUX to take photos for incident reports.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Allow VIGILUX to access your photos to attach evidence to reports.</string>
```

### Android - AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

Already configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow VIGILUX to access your photos...",
          "cameraPermission": "Allow VIGILUX to take photos..."
        }
      ]
    ]
  }
}
```

## Error Handling

### Validation Errors

```javascript
// File too large
'Image size exceeds 10 MB limit. Please choose a smaller image.';

// Invalid format
'Invalid image format. Only JPEG and PNG are supported.';

// Too many images
'Maximum 5 images allowed per report.';

// Dimensions too large
'Image dimensions exceed maximum (4096x4096).';
```

### Upload Errors

```javascript
// Network error
'Image upload failed. Please check your connection and try again.';

// Partial upload
'Report submitted, but 2 photo(s) failed to upload. You can add them later.';

// Complete failure
'Your report was submitted successfully, but photos could not be uploaded.';
```

## Backend API Endpoint

### POST /api/reports/:reportId/media

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**

```
media: File[] (up to 5 files)
```

**Response:**

```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "uploaded": 3,
    "failed": 0,
    "files": [
      {
        "id": "uuid-1",
        "url": "/uploads/reports/uuid-1.jpg",
        "type": "image/jpeg",
        "size": 654321
      }
    ]
  }
}
```

## Testing Checklist

### Functional Tests

- [ ] Camera opens and captures photo
- [ ] Gallery opens and allows selection
- [ ] Multiple images can be selected (up to 5)
- [ ] 6th image shows "Maximum reached" message
- [ ] Delete removes image from selection
- [ ] Validation rejects oversized images
- [ ] Validation rejects invalid formats
- [ ] Compression reduces file size by 60%+
- [ ] Upload progress shows accurately
- [ ] Report submits without images
- [ ] Report submits with images
- [ ] Retry works on network failure
- [ ] Partial upload shows appropriate message

### Permission Tests

- [ ] Camera permission prompt appears
- [ ] Gallery permission prompt appears
- [ ] Denial shows settings alert
- [ ] Approval allows access

### UI Tests

- [ ] Thumbnails display correctly
- [ ] Full-screen viewer works
- [ ] Swipe between images works
- [ ] Delete confirmation appears
- [ ] Progress bar animates smoothly
- [ ] Loading states show appropriately

## Performance Considerations

### Compression

- Client-side compression reduces server load
- Uses native image manipulation (fast)
- Processes images sequentially to avoid memory issues

### Upload

- Multipart form-data for efficient transfer
- Progress callbacks for UX feedback
- Retry logic prevents data loss
- Cleanup prevents storage bloat

### Memory Management

- Images processed one at a time
- Temporary files cleaned immediately after upload
- Thumbnails use lower quality to save RAM

## Security Considerations

### File Validation

```javascript
// Client-side validation
1. Check file size < 10 MB
2. Verify MIME type (image/jpeg or image/png)
3. Check dimensions < 4096x4096

// Server-side validation (backend)
1. Re-verify file signature (magic numbers)
2. Check MIME type from file content
3. Scan for malware (if needed)
4. Validate against user quota
```

### Upload Security

- JWT authentication required
- File uploads scoped to report owner
- Secure filename generation (UUIDs)
- Files stored outside web root
- Content-Type validation

## Troubleshooting

### Images not uploading

1. Check network connectivity
2. Verify auth token is valid
3. Check server endpoint is correct
4. Ensure backend accepts multipart/form-data
5. Check server file size limits

### Compression failing

1. Check image file exists
2. Verify image dimensions are set
3. Ensure expo-image-manipulator is installed
4. Check device has enough storage space

### Permissions denied

1. Guide user to device settings
2. Show clear permission rationale
3. Handle gracefully (allow report without photos)

## Future Enhancements

### Phase 2 Features

- [ ] Video upload support (max 30s clips)
- [ ] Image annotation (draw, add text)
- [ ] Live photo support
- [ ] Document scanning (OCR for license plates, etc.)

### Phase 3 Features

- [ ] Cloud storage integration (S3, CloudFlare)
- [ ] Background upload queue
- [ ] Offline support with sync
- [ ] Advanced filters and editing

## Dependencies

```json
{
  "expo-image-picker": "~16.0.0",
  "expo-image-manipulator": "~13.0.0",
  "expo-file-system": "~18.0.0",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

## Related Documentation

- Backend file validation: `docs/FILE-VALIDATION.md`
- Report API: `docs/API-REPORTS.md`
- Image manipulator docs: https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
- File system docs: https://docs.expo.dev/versions/latest/sdk/filesystem/

## Support

For issues:

1. Check console logs for errors
2. Review validation error messages
3. Test with different image sizes/formats
4. Verify permissions are granted
5. Check backend logs for upload failures
