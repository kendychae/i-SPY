# File Validation Rules and Security Guidelines

## Version 1.0

**Last Updated:** March 20, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Allowed File Types](#allowed-file-types)
3. [Size Limits](#size-limits)
4. [File Signature Validation](#file-signature-validation)
5. [Security Measures](#security-measures)
6. [Sanitization Requirements](#sanitization-requirements)
7. [Implementation Guide](#implementation-guide)

---

## Overview

This document defines comprehensive file validation rules for the VIGILUX platform to ensure security, performance, and user experience. All media uploads (images and videos) must pass these validation checks before being stored and associated with incident reports.

---

## Allowed File Types

### Images

#### Allowed MIME Types

- `image/jpeg` (JPEG/JPG)
- `image/png` (PNG)

#### File Extensions

- `.jpg`
- `.jpeg`
- `.png`

#### Technical Requirements

- **Min Resolution:** 320 x 240 pixels
- **Max Resolution:** 4096 x 4096 pixels
- **Color Space:** RGB or Grayscale
- **Compression:** Standard JPEG/PNG compression
- **Metadata:** EXIF data preserved (for timestamps/location)

### Videos

#### Allowed MIME Types

- `video/mp4` (MP4/MPEG-4)

#### File Extensions

- `.mp4`

#### Technical Requirements

- **Max Duration:** 60 seconds
- **Max Resolution:** 1920 x 1080 pixels (1080p)
- **Codec:** H.264 (Main or High Profile)
- **Audio Codec:** AAC
- **Frame Rate:** Max 30 fps
- **Bit Rate:** Max 8 Mbps

### Rejected File Types

The following file types are **explicitly rejected**:

- Executable files (`.exe`, `.bat`, `.sh`, `.cmd`)
- Script files (`.js`, `.php`, `.py`, `.rb`)
- Archive files (`.zip`, `.rar`, `.7z`, `.tar`)
- Document files (`.pdf`, `.doc`, `.xls`)
- SVG images (due to potential XSS vulnerabilities)
- Animated files (`.gif`, `.webp` with animation)

---

## Size Limits

### Individual File Limits

| File Type  | Maximum Size | Recommended Size |
| ---------- | ------------ | ---------------- |
| JPEG Image | 10 MB        | 2-5 MB           |
| PNG Image  | 10 MB        | 1-3 MB           |
| MP4 Video  | 50 MB        | 10-20 MB         |

### Aggregate Limits

- **Max Files per Report:** 5 files
- **Max Total Size per Report:** 100 MB
- **Max Upload Size per Request:** 100 MB
- **User Daily Upload Quota:** 500 MB per user per day

### Enforcement

Size limits are enforced at multiple levels:

1. **Client-side:** Pre-upload validation with user feedback
2. **API Gateway:** Request size limiting
3. **Application Server:** Multer middleware validation
4. **Storage Service:** Final size check before persistence

---

## File Signature Validation

To prevent file type spoofing (changing extension to bypass filters), all uploads undergo **magic number** (file signature) validation.

### Implementation

Files are validated by reading the first bytes (file header) to verify the actual file type matches the claimed MIME type and extension.

#### JPEG File Signatures

```
FF D8 FF E0 (JFIF)
FF D8 FF E1 (EXIF)
FF D8 FF E2 (Canon)
FF D8 FF E8 (SPIFF)
```

#### PNG File Signature

```
89 50 4E 47 0D 0A 1A 0A
```

#### MP4 File Signatures

```
00 00 00 18 66 74 79 70 (ftyp)
00 00 00 1C 66 74 79 70 (ftyp)
```

### Validation Process

1. Read first 8-12 bytes of uploaded file
2. Compare against known file signatures
3. Verify signature matches claimed MIME type
4. Reject files with mismatched signatures
5. Log suspicious attempts for security review

---

## Security Measures

### 1. Content Security Policy

All uploaded files are served with restrictive Content-Security-Policy headers:

```
Content-Security-Policy: default-src 'none'; img-src 'self'; media-src 'self';
X-Content-Type-Options: nosniff
```

### 2. Malware Scanning

#### Pre-Storage Scanning

All files undergo virus scanning before storage using:

- ClamAV antivirus engine (open-source)
- Or commercial solution (e.g., VirusTotal API)

#### Scanning Process

1. Upload received and temporarily stored
2. File sent to scanning service
3. If clean: proceed to permanent storage
4. If infected: delete file, return error to user
5. Log all scan results for audit

#### False Positive Handling

- Manual review process for flagged files
- User notification with appeal option
- Quarantine suspicious files for 72 hours

### 3. File Storage Isolation

- Uploaded files stored in separate S3 bucket/storage
- Never executed or interpreted by application server
- Served through CDN with proper content-type headers
- No direct file system access from web server

### 4. Filename Sanitization

Original filenames are **never used directly**:

```javascript
// Original: photo-2026-03-20.jpg
// Stored as: 550e8400-e29b-41d4-a716-446655440000.jpg
```

#### Sanitization Rules

1. Generate UUID for unique filename
2. Preserve original extension (after validation)
3. Remove special characters from stored metadata
4. Prevent path traversal attacks (`../`, `..\\`)
5. Limit filename length to 255 characters

### 5. URL Security

Uploaded files served via signed URLs with:

- Time-limited access (1-hour expiration)
- Single-use tokens (optional for sensitive content)
- HTTPS-only delivery
- Origin validation

### 6. Rate Limiting

Upload rate limits prevent abuse:

| Limit Type          | Threshold   | Time Window |
| ------------------- | ----------- | ----------- |
| Uploads per user    | 20 files    | 1 hour      |
| Total data per user | 500 MB      | 24 hours    |
| Failed uploads      | 10 attempts | 1 hour      |

### 7. User Authentication

- All uploads require valid JWT token
- Only authenticated users can upload
- User ID associated with every file
- Access control based on ownership

---

## Sanitization Requirements

### Image Sanitization

#### Metadata Handling

**Preserve:**

- Timestamp (DateTimeOriginal)
- GPS coordinates (if present and user consents)
- Camera make/model (for forensics)

**Remove:**

- User comments and descriptions
- Software/editor metadata
- Thumbnail images
- Color profile ICC data (convert to sRGB)
- Potentially identifying information

#### Implementation

Use image processing libraries that strip unnecessary metadata:

- **Sharp** (Node.js): Fast, secure image processing
- **ImageMagick** with sanitize flags: Comprehensive metadata control

```javascript
// Example: Strip metadata with Sharp
await sharp(inputBuffer)
  .jpeg({ quality: 85, mozjpeg: true })
  .withMetadata({
    exif: {
      IFD0: {
        Copyright: 'VIGILUX Platform',
      },
    },
  })
  .toBuffer();
```

### Video Sanitization

Videos require more processing:

1. Strip metadata tracks
2. Re-encode to standardized format (H.264/AAC)
3. Remove subtitles/captions
4. Standardize resolution and bitrate
5. Generate thumbnail for preview

---

## Implementation Guide

### Backend Validation Flow

```
1. Request received at API endpoint
   ↓
2. Multer middleware validates file size and count
   ↓
3. MIME type validated against whitelist
   ↓
4. File signature checked (magic number)
   ↓
5. File temporarily stored to disk/memory
   ↓
6. Virus/malware scan performed
   ↓
7. Image/video processing and sanitization
   ↓
8. Upload to permanent storage (S3/Cloud)
   ↓
9. Database record created with file metadata
   ↓
10. Temporary file deleted
   ↓
11. Success response with file URL
```

### Validation Middleware (Multer)

```javascript
const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'video/mp4'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, and MP4 are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max
    files: 5, // Max 5 files per request
  },
  fileFilter: fileFilter,
});
```

### File Signature Validation

```javascript
const fileSignatures = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe8],
  ],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'video/mp4': [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70],
  ],
};

function validateFileSignature(buffer, mimeType) {
  const signatures = fileSignatures[mimeType];
  if (!signatures) return false;

  for (const signature of signatures) {
    const match = signature.every((byte, index) => buffer[index] === byte);
    if (match) return true;
  }

  return false;
}
```

### Client-Side Validation (React Native)

```javascript
const validateFile = (file) => {
  const errors = [];

  // Check size
  if (file.fileSize > 10 * 1024 * 1024) {
    errors.push('File size exceeds 10 MB limit');
  }

  // Check type
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type');
  }

  // Check extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.mp4'];
  const ext = file.fileName
    .substring(file.fileName.lastIndexOf('.'))
    .toLowerCase();
  if (!validExtensions.includes(ext)) {
    errors.push('Invalid file extension');
  }

  return errors;
};
```

---

## Error Messages

### User-Friendly Error Messages

Provide clear, actionable error messages to users:

| Error             | Message                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| Invalid type      | "Please upload only JPEG, PNG, or MP4 files."                              |
| File too large    | "File size exceeds 10 MB limit. Please compress or select a smaller file." |
| Too many files    | "You can upload a maximum of 5 files per report."                          |
| Virus detected    | "File failed security scan and cannot be uploaded."                        |
| Invalid signature | "File appears to be corrupted or invalid. Please try another file."        |
| Quota exceeded    | "Daily upload limit reached. Please try again tomorrow."                   |

---

## Monitoring and Logging

### Metrics to Track

- Upload success/failure rates
- Average file sizes
- File type distribution
- Virus scan results
- Rate limit violations
- Invalid file type attempts

### Security Alerts

Trigger alerts for:

- Multiple failed virus scans from same user
- Repeated file signature mismatches
- Unusual file upload patterns
- Rate limit violations

---

## Compliance Considerations

### GDPR and Privacy

- User consent for GPS metadata retention
- Right to deletion includes uploaded media
- Data retention policy: 7 years for evidence
- Encryption at rest and in transit

### Accessibility

- Alt text generated for images (AI-assisted)
- Video captions support planned
- Screen reader compatibility

---

## Future Enhancements

1. **HEIC/HEIF Support:** Modern iPhone image format
2. **WebP Support:** Better compression ratios
3. **Live Photos:** iOS native format support
4. **AI-Powered Validation:** Detect inappropriate content
5. **Blockchain Verification:** Tamper-proof evidence chain
6. **Automated Redaction:** PII removal from images

---

## References

- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [ClamAV Documentation](https://docs.clamav.net/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Multer Documentation](https://github.com/expressjs/multer)

---

**Document Maintained By:** Development Team  
**Last Reviewed:** March 20, 2026  
**Next Review Date:** June 20, 2026
