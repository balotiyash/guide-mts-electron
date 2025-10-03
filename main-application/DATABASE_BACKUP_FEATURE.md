# Database Backup Feature

## Overview
The database backup feature allows users to create a copy of their current SQLite database file to any location on their system. This feature is essential for data protection and disaster recovery.

## Implementation Details

### 1. User Interface (Dashboard)
- **Location**: Dashboard page (`src/views/dashboard.html`)
- **Button**: Existing "Backup" button in the left buttons section
- **Visual Feedback**: Button text changes to "Backing up..." during the process

### 2. Frontend Implementation (`dashboard.js`)
- **Button Detection**: Automatically finds the backup button by its text content
- **Loading State**: Provides visual feedback during backup process
- **Error Handling**: Comprehensive error handling with user notifications
- **Result Display**: Shows success/failure messages via dialog boxes

### 3. Backend Implementation (`main.js`)
- **IPC Handler**: `backup-database` handler processes backup requests
- **File Operations**: Uses Node.js `fs.copyFileSync()` for reliable file copying
- **Date Formatting**: Generates filename with current date in DD-MM-YYYY format
- **File Dialog**: Native OS save dialog for user-friendly file selection

### 4. API Integration (`preload.js`)
- **Secure API**: `backupDatabase()` method exposed to renderer process
- **IPC Communication**: Uses `ipcRenderer.invoke()` for async communication

## Features

### ✅ **Automatic Filename Generation**
- Format: `GMTS DD-MM-YYYY.sqlite3`
- Example: `GMTS 01-10-2025.sqlite3` (for October 1, 2025)
- Uses current system date automatically

### ✅ **Native File Dialog**
- OS-native save dialog for familiar user experience
- Pre-populated filename with current date
- Multiple file type filters (sqlite3, db, all files)
- User can change filename and location as needed

### ✅ **Reliable File Copying**
- Uses `fs.copyFileSync()` for synchronous, reliable copying
- Preserves file integrity and database structure
- No modification to original database file

### ✅ **Comprehensive Error Handling**
- Database file existence validation
- File system error handling
- User cancellation handling
- Network/permission error recovery

### ✅ **User Feedback**
- Loading indicator during backup process
- Success/failure dialog messages
- Complete file path information in success message
- Detailed error messages for troubleshooting

## Usage Instructions

### For Users:
1. **Navigate to Dashboard**: Open the application and go to the main dashboard
2. **Click Backup Button**: Click the "Backup" button in the left panel
3. **Choose Location**: Select where to save the backup file using the file dialog
4. **Modify Filename** (optional): Change the default filename if desired
5. **Confirm Backup**: Click "Save" to create the backup
6. **View Result**: Check the success/failure message dialog

### For Developers:
```javascript
// API call example
const result = await window.electronAPI.backupDatabase();
if (result.success) {
    console.log('Backup saved to:', result.backupPath);
} else {
    console.error('Backup failed:', result.message);
}
```

## File Structure

### Modified Files:
- `src/scripts/preload.js` - Added backup API
- `src/scripts/main.js` - Added backup IPC handler
- `src/scripts/renderer/dashboard.js` - Added backup button functionality

### Dependencies:
- Node.js `fs` module for file operations
- Electron `dialog` module for file selection
- Existing database service for path resolution

## Technical Specifications

### File Naming Convention:
```
Format: GMTS DD-MM-YYYY.sqlite3
Pattern: /^GMTS \d{2}-\d{2}-\d{4}\.sqlite3$/
Example: GMTS 01-10-2025.sqlite3
```

### Supported File Types:
- `.sqlite3` (Primary)
- `.db` (Alternative)
- `.*` (All files)

### Error Scenarios Handled:
1. **Database Not Found**: Original database file missing or inaccessible
2. **User Cancellation**: User closes dialog without selecting location
3. **Permission Errors**: Insufficient write permissions to target location
4. **Disk Space**: Insufficient storage space for backup
5. **File System Errors**: General I/O errors during copying

### Return Value Structure:
```javascript
{
    success: boolean,        // true if backup successful
    message: string,         // User-friendly status message
    backupPath?: string     // Full path to backup file (on success)
}
```

## Security Considerations

### ✅ **Secure File Operations**
- Uses Node.js built-in file system methods
- No shell command execution
- Preserves file permissions and metadata

### ✅ **Path Validation**
- Validates source database existence
- Uses Electron's secure dialog API
- No arbitrary file path construction

### ✅ **Error Information**
- Sanitized error messages for users
- Detailed logging for developers
- No sensitive path information in user messages

## Testing Recommendations

### Manual Testing:
1. **Happy Path**: Backup to various locations with different filenames
2. **Edge Cases**: Cancel dialog, insufficient permissions, full disk
3. **Multiple Backups**: Create multiple backups to verify no conflicts
4. **File Integrity**: Verify backed up database opens correctly

### Automated Testing:
1. **Unit Tests**: Test filename generation and date formatting
2. **Integration Tests**: Test IPC communication between processes
3. **File System Tests**: Mock file operations for error scenarios

## Future Enhancements

### Potential Improvements:
1. **Scheduled Backups**: Automatic daily/weekly backup scheduling
2. **Backup Verification**: Post-backup integrity checking
3. **Compression**: Optional ZIP compression for smaller backup files
4. **Cloud Storage**: Integration with cloud storage providers
5. **Backup History**: Track and manage previous backup locations
6. **Restore Functionality**: Quick restore from backup files

### Configuration Options:
1. **Custom Filename Patterns**: User-defined naming conventions
2. **Default Backup Location**: Configurable default save directory
3. **Backup Retention**: Automatic cleanup of old backup files

## Troubleshooting

### Common Issues:

**Backup Button Not Working:**
- Check browser console for JavaScript errors
- Verify backup button exists with text "Backup"
- Ensure all files are properly imported

**File Dialog Not Appearing:**
- Check Electron permissions
- Verify main process is properly handling IPC calls
- Look for dialog-related errors in main process logs

**Backup Fails:**
- Verify original database file exists and is accessible
- Check write permissions to target directory
- Ensure sufficient disk space for backup

**Error Messages:**
- "Database file not found": Original database is missing or moved
- "Backup canceled by user": User closed dialog without saving
- "Backup failed": Generic error - check console for details

This backup feature provides a robust, user-friendly solution for database protection with comprehensive error handling and a seamless user experience.