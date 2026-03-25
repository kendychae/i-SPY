# File Storage API Usage

## Upload a File

- Endpoint: `POST /api/v1/reports/upload`
- Auth: Bearer token required
- Form field: `file` (single file)
- Response: `{ message, filePath, originalName, mimetype, size }`

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

## Example

Upload an image as user 123 on 2026-03-25:

```
backend/uploads/123/2026-03-25/image/photo_1648234567890.jpg
```

---

For testing, use Postman or curl with a valid JWT token.
