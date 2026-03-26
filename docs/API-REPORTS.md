# Report Submission API Documentation

## Version 1.0

**Last Updated:** March 20, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Validation Rules](#validation-rules)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

The Report Submission API enables authenticated users to create, retrieve, and manage incident reports within the VIGILUX platform. All endpoints require JWT authentication and follow RESTful conventions.

**Base URL:** `https://api.vigilux.com/api/v1`

---

## Authentication

All report endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## API Endpoints

### 1. Create Report

**POST** `/reports`

Creates a new incident report with optional media attachments.

#### Request Headers

```
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>
```

#### Request Body (Form Data)

| Field         | Type    | Required | Description                                 |
| ------------- | ------- | -------- | ------------------------------------------- |
| title         | string  | Yes      | Report title (3-255 characters)             |
| description   | string  | Yes      | Detailed description (10-5000 characters)   |
| incident_type | string  | Yes      | Type of incident (see allowed values below) |
| latitude      | decimal | Yes      | GPS latitude (-90 to 90)                    |
| longitude     | decimal | Yes      | GPS longitude (-180 to 180)                 |
| address       | string  | No       | Human-readable address                      |
| incident_date | ISO8601 | Yes      | Date/time of incident                       |
| priority      | string  | No       | Priority level (low/medium/high/urgent)     |
| media[]       | file    | No       | Image or video files (max 5 files)          |

#### Allowed Incident Types

- `theft`
- `vandalism`
- `assault`
- `suspicious_activity`
- `traffic_violation`
- `noise_complaint`
- `fire`
- `medical_emergency`
- `other`

#### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Suspicious vehicle in neighborhood",
    "description": "White van parked for 3 hours with no visible occupants",
    "incident_type": "suspicious_activity",
    "status": "submitted",
    "priority": "medium",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "address": "123 Main St, Los Angeles, CA 90001",
    "incident_date": "2026-03-20T14:30:00Z",
    "created_at": "2026-03-20T15:00:00Z",
    "updated_at": "2026-03-20T15:00:00Z",
    "media": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "file_url": "https://storage.vigilux.com/reports/550e8400/image1.jpg",
        "file_type": "image/jpeg",
        "file_size": 2456789,
        "uploaded_at": "2026-03-20T15:00:00Z"
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - Validation failed

```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "title",
      "message": "Title must be between 3 and 255 characters"
    }
  ]
}
```

**401 Unauthorized** - Invalid or missing token

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

**413 Payload Too Large** - File size exceeded

```json
{
  "success": false,
  "error": "Payload Too Large",
  "message": "Media files exceed maximum size limit"
}
```

---

### 2. Get Reports (List)

**GET** `/reports`

Retrieves a paginated list of incident reports with filtering options.

#### Query Parameters

| Parameter     | Type    | Required | Description                               |
| ------------- | ------- | -------- | ----------------------------------------- |
| page          | integer | No       | Page number (default: 1)                  |
| limit         | integer | No       | Items per page (default: 20, max: 100)    |
| status        | string  | No       | Filter by status (comma-separated)        |
| incident_type | string  | No       | Filter by incident type (comma-separated) |
| priority      | string  | No       | Filter by priority (comma-separated)      |
| start_date    | ISO8601 | No       | Filter reports after this date            |
| end_date      | ISO8601 | No       | Filter reports before this date           |
| latitude      | decimal | No       | Center latitude for geographic filter     |
| longitude     | decimal | No       | Center longitude for geographic filter    |
| radius        | integer | No       | Radius in meters (requires lat/lng)       |
| sort          | string  | No       | Sort field (default: created_at)          |
| order         | string  | No       | Sort order: asc or desc (default: desc)   |

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Suspicious vehicle in neighborhood",
      "incident_type": "suspicious_activity",
      "status": "submitted",
      "priority": "medium",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "address": "123 Main St, Los Angeles, CA 90001",
      "incident_date": "2026-03-20T14:30:00Z",
      "created_at": "2026-03-20T15:00:00Z",
      "distance_meters": 1250,
      "media_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### 3. Get Report by ID

**GET** `/reports/:id`

Retrieves detailed information about a specific report.

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Suspicious vehicle in neighborhood",
    "description": "White van parked for 3 hours with no visible occupants",
    "incident_type": "suspicious_activity",
    "status": "submitted",
    "priority": "medium",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "address": "123 Main St, Los Angeles, CA 90001",
    "incident_date": "2026-03-20T14:30:00Z",
    "created_at": "2026-03-20T15:00:00Z",
    "updated_at": "2026-03-20T15:00:00Z",
    "media": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "file_url": "https://storage.vigilux.com/reports/550e8400/image1.jpg",
        "file_type": "image/jpeg",
        "file_size": 2456789,
        "uploaded_at": "2026-03-20T15:00:00Z"
      }
    ],
    "updates": []
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Report not found"
}
```

---

### 4. Update Report

**PATCH** `/reports/:id`

Updates an existing report (only by report creator or admin).

#### Request Body

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "high"
}
```

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated title",
    "updated_at": "2026-03-20T16:00:00Z"
  }
}
```

---

### 5. Delete Report

**DELETE** `/reports/:id`

Soft deletes a report (only by report creator or admin).

#### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Data Models

### Report Object

```typescript
interface Report {
  id: string; // UUID
  user_id: string; // UUID (foreign key)
  title: string; // 3-255 characters
  description: string; // 10-5000 characters
  incident_type: IncidentType; // Enum
  status: ReportStatus; // Enum
  priority: Priority; // Enum
  latitude: number; // Decimal(-90, 90)
  longitude: number; // Decimal(-180, 180)
  address?: string; // Optional address
  incident_date: string; // ISO8601 datetime
  created_at: string; // ISO8601 datetime
  updated_at: string; // ISO8601 datetime
  media?: Media[]; // Optional media array
  updates?: ReportUpdate[]; // Optional updates array
}
```

### Media Object

```typescript
interface Media {
  id: string; // UUID
  report_id: string; // UUID (foreign key)
  file_url: string; // S3/storage URL
  file_type: string; // MIME type
  file_size: number; // Bytes
  uploaded_at: string; // ISO8601 datetime
}
```

### Report Update Object

```typescript
interface ReportUpdate {
  id: string; // UUID
  report_id: string; // UUID (foreign key)
  user_id: string; // UUID (foreign key)
  update_text: string; // Update message
  is_internal: boolean; // Internal note flag
  created_at: string; // ISO8601 datetime
}
```

---

## Validation Rules

### Title

- **Required:** Yes
- **Type:** String
- **Min Length:** 3 characters
- **Max Length:** 255 characters
- **Pattern:** Alphanumeric with spaces and common punctuation

### Description

- **Required:** Yes
- **Type:** String
- **Min Length:** 10 characters
- **Max Length:** 5000 characters

### Incident Type

- **Required:** Yes
- **Type:** Enum
- **Allowed Values:** theft, vandalism, assault, suspicious_activity, traffic_violation, noise_complaint, fire, medical_emergency, other

### Location Coordinates

- **Required:** Yes
- **Latitude Range:** -90 to 90
- **Longitude Range:** -180 to 180
- **Precision:** Up to 8 decimal places

### Incident Date

- **Required:** Yes
- **Type:** ISO8601 datetime
- **Validation:** Cannot be more than 7 days in the past or in the future

### Media Files

- **Required:** No
- **Max Files:** 5 per report
- **Max Size (Images):** 10 MB per file
- **Max Size (Videos):** 50 MB per file
- **Allowed Types:** image/jpeg, image/png, video/mp4

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [] // Optional array of field-specific errors
}
```

### HTTP Status Codes

| Code | Description                                |
| ---- | ------------------------------------------ |
| 200  | OK - Request successful                    |
| 201  | Created - Resource created successfully    |
| 400  | Bad Request - Validation failed            |
| 401  | Unauthorized - Authentication required     |
| 403  | Forbidden - Insufficient permissions       |
| 404  | Not Found - Resource not found             |
| 413  | Payload Too Large - File size exceeded     |
| 422  | Unprocessable Entity - Invalid data format |
| 429  | Too Many Requests - Rate limit exceeded    |
| 500  | Internal Server Error - Server error       |

### Rate Limiting

- **Report Creation:** 10 reports per hour per user
- **Report Listing:** 100 requests per minute per user
- **Media Upload:** 50 MB total per hour per user

---

## Examples

### Example 1: Creating a Report with Image

```bash
curl -X POST https://api.vigilux.com/api/v1/reports \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "title=Broken streetlight" \
  -F "description=Streetlight at corner of Main and 5th has been out for 3 days" \
  -F "incident_type=other" \
  -F "latitude=34.0522" \
  -F "longitude=-118.2437" \
  -F "incident_date=2026-03-20T19:00:00Z" \
  -F "media=@photo.jpg"
```

### Example 2: Filtering Reports by Location

```bash
curl -X GET "https://api.vigilux.com/api/v1/reports?latitude=34.0522&longitude=-118.2437&radius=5000&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example 3: Filtering by Status and Type

```bash
curl -X GET "https://api.vigilux.com/api/v1/reports?status=submitted,under_review&incident_type=theft,vandalism&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Performance Considerations

- Geospatial queries use PostGIS spatial indexing
- Target response time: < 100ms for list queries
- Target response time: < 50ms for single report queries
- Pagination recommended for large result sets
- Media files served via CDN with caching

---

## Security Considerations

- All endpoints require JWT authentication
- User can only update/delete their own reports
- Admin/officer roles can access all reports
- Media files virus-scanned before storage
- HTTPS required for all API calls
- File signature validation prevents spoofing
