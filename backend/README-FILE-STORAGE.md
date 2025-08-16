# File Storage System Update

## Overview
The blood bank application has been updated to store uploaded files directly in the MongoDB database instead of saving them to the local filesystem.

## Changes Made

### 1. Database Model Updates (`models/Donor.js`)
- Added `photo` and `governmentId` fields to store file data as Buffer
- Each file field contains:
  - `data`: The actual file content as a Buffer
  - `contentType`: MIME type of the file
  - `filename`: Original filename
- Kept `photoUrl` and `governmentIdUrl` for backward compatibility

### 2. File Upload Route Updates (`routes/donors.js`)
- Changed from `multer.diskStorage` to `multer.memoryStorage`
- Files are now stored in memory as Buffer during upload
- File data is saved directly to the database
- Added routes to serve files from database:
  - `GET /api/donors/photo/:id` - Serve donor photo
  - `GET /api/donors/document/:id` - Serve government ID document

### 3. Server Configuration (`server.js`)
- Removed static file serving for uploads directory
- Files are now served dynamically from database

## Benefits

1. **Centralized Storage**: All data (including files) is stored in one place
2. **No File System Dependencies**: Eliminates issues with file paths and permissions
3. **Better Backup**: Files are included in database backups
4. **Scalability**: Easier to scale across multiple servers
5. **Data Integrity**: Files are tied directly to donor records

## File Size Limits

- Maximum file size: 5MB per file
- Supported photo formats: All image types
- Supported document formats: Images and PDFs

## API Endpoints

### File Upload
```
POST /api/donors/register
Content-Type: multipart/form-data

Fields:
- photo: Profile photo file
- governmentId: Government ID document file
- fullName, phone, bloodGroup, age, sex (required)
- whatsapp, gmail (optional)
```

### File Retrieval
```
GET /api/donors/photo/:donorId
GET /api/donors/document/:donorId
```

## Testing

Run the test script to verify file storage:
```bash
cd backend
node test-upload.js
```

## Migration Notes

- Existing donors with file URLs will continue to work
- New registrations will store files in the database
- The `uploads/` directory is no longer used for new files
- Consider migrating existing files to database if needed

## Performance Considerations

- Files are loaded into memory during upload (5MB limit)
- Database size will increase with file storage
- Consider implementing file compression for large images
- For production with many files, consider using GridFS for files > 16MB

## Security

- File type validation is maintained
- File size limits prevent abuse
- Files are served with proper Content-Type headers
- Access control through authentication middleware
