# File Storage API Usage

## Upload a File

- Endpoint: `POST /api/v1/reports/upload`
- Auth: Bearer token required
- Form field: `file` (single file)
- Optional field: `reportId` (UUID of report to link media)
- Response: `{ message, filePath, originalName, mimetype, size, media }`

## Serve a File

- Endpoint: `GET /api/v1/reports/file/:userId/:date/:type/:filename`
- Auth: Bearer token required
- Returns: File download/stream if exists

## Storage Structure

Files are stored in:

```
backend/uploads/{userId}/{YYYY-MM-DD}/{fileType}/{filename}
```

- `userId`: from authenticated user
- `YYYY-MM-DD`: upload date
- `fileType`: e.g., image, application
- `filename`: original name with timestamp

## Media Table (Database)

Uploaded files can be linked to reports. The `media` table schema:

```
CREATE TABLE IF NOT EXISTS media (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
	file_url TEXT NOT NULL,
	file_type VARCHAR(50) NOT NULL,
	file_size INTEGER,
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

When uploading, include `reportId` in the form data to link the file to a report. The API will create a media record.

## Example

Upload an image as user 123 on 2026-03-25:

```
backend/uploads/123/2026-03-25/image/photo_1648234567890.jpg
```

---

For testing, use Postman or curl with a valid JWT token.
