# Change Database Feature

## Overview
The "Change Database" feature allows users to switch between different SQLite database files without restarting the application. This feature is accessible through the Tools menu in the menu bar.

## Implementation Details

### 1. Menu Integration
- **Location**: Tools → Change Database
- **Access**: Available from any page once the menu is loaded (after login)
- **Position**: First item in the Tools submenu

### 2. User Interface Flow
1. **Menu Click**: User clicks "Change Database" from Tools menu
2. **Confirmation Dialog**: System asks for confirmation before proceeding
3. **File Selection**: Native file dialog opens for database selection
4. **Success/Error Feedback**: User receives feedback about the operation
5. **Application Reload**: Dashboard reloads with new database connection

### 3. Technical Implementation

#### Menu Handler (`menu.js`)
```javascript
{
    label: 'Change Database',
    click: () => {
        win.webContents.send('change-database-request');
    },
}
```

#### IPC Communication (`preload.js`)
```javascript
// API to change database
changeDatabase: () => ipcRenderer.invoke('change-database'),

// Listen for change database requests from menu
onChangeDatabaseRequest: (callback) => ipcRenderer.on('change-database-request', callback),
```

#### Main Process Handler (`main.js`)
```javascript
ipcMain.handle('change-database', async (event) => {
    // File selection dialog
    // Database validation
    // Storage update
    // Success/Error response
});
```

#### Dashboard Integration (`dashboard.js`)
```javascript
window.electronAPI.onChangeDatabaseRequest(async () => {
    // Confirmation dialog
    // Database change request
    // Result handling
    // Page reload
});
```

## Features

### ✅ **User Confirmation**
- Confirmation dialog before changing database
- Clear warning about closing current connection
- User can cancel the operation

### ✅ **File Validation**
- Validates selected file exists
- Supports multiple database file extensions
- Error handling for invalid files

### ✅ **Storage Management**
- Updates electron-store with new database path
- Persistent storage across application restarts
- Secure path handling

### ✅ **User Feedback**
- Success messages with new database path
- Clear error messages for failures
- Visual feedback during the process

### ✅ **Application Integration**
- Automatic dashboard reload with new database
- Seamless transition between databases
- No application restart required

## Usage Instructions

### For Users:
1. **Access Menu**: Ensure you're logged in and the menu bar is visible
2. **Navigate**: Click "Tools" in the menu bar
3. **Select Option**: Click "Change Database"
4. **Confirm Action**: Click "Yes" in the confirmation dialog
5. **Choose Database**: Select the new SQLite database file
6. **Wait for Reload**: Dashboard will automatically reload with new database

### For Developers:
```javascript
// Trigger database change programmatically
const result = await window.electronAPI.changeDatabase();
if (result.success) {
    location.reload();
}
```

## File Structure

### Modified Files:
- `src/scripts/menu.js` - Added Tools menu with Change Database option
- `src/scripts/preload.js` - Added change database APIs
- `src/scripts/main.js` - Added change database IPC handler
- `src/scripts/renderer/dashboard.js` - Added change database event handling

### Dependencies:
- `electron-store` - For persistent database path storage
- `electron` dialog module - For file selection
- Existing database service architecture

## Supported File Types

### Primary:
- `.sqlite3` - SQLite database files
- `.db` - Generic database files

### Fallback:
- `*` - All files (for flexibility)

## Error Handling

### Validation Scenarios:
1. **User Cancellation**: Operation canceled by user
2. **File Not Found**: Selected file doesn't exist
3. **Storage Error**: Failed to update database path
4. **Permission Issues**: Insufficient file access permissions

### Error Messages:
- **User Friendly**: Clear, non-technical language
- **Actionable**: Specific guidance for resolution
- **Detailed Logging**: Technical details in console for debugging

## Security Considerations

### ✅ **File System Security**
- Uses Electron's secure dialog API
- Validates file existence before processing
- No arbitrary path construction

### ✅ **Storage Security**
- Uses electron-store's secure storage methods
- Validates paths before storage
- Prevents path injection attacks

### ✅ **Process Isolation**
- Secure IPC communication between processes
- No direct file system access from renderer
- Proper context isolation maintained

## Testing Recommendations

### Manual Testing:
1. **Happy Path**: Select valid database file and verify change
2. **Cancellation**: Cancel operation and verify no changes
3. **Invalid Files**: Select non-database files and verify error handling
4. **Permission Issues**: Test with read-only files

### Edge Cases:
1. **Duplicate Selection**: Select the currently active database
2. **Large Files**: Test with large database files
3. **Network Drives**: Test with databases on network locations
4. **Special Characters**: Test with paths containing special characters

## Integration with Existing Features

### Database Service Compatibility:
- Works with existing `dbService.js` architecture
- Uses same storage mechanism as initial database selection
- Maintains compatibility with all database operations

### Menu System Integration:
- Follows existing menu structure patterns
- Consistent with other Tools menu items
- Proper separation and organization

## Future Enhancements

### Potential Improvements:
1. **Recent Databases**: List of recently used databases
2. **Database Validation**: Verify database schema before switching
3. **Backup Prompt**: Offer to backup current database before switching
4. **Database Info**: Display current database information
5. **Quick Switch**: Keyboard shortcuts for common databases

### Configuration Options:
1. **Default Locations**: Configurable default database directories
2. **File Filters**: Customizable file type filters
3. **Confirmation Settings**: Option to disable confirmation dialog
4. **Auto-Reload**: Option to disable automatic dashboard reload

## Troubleshooting

### Common Issues:

**Menu Not Visible:**
- Ensure you're logged in (menu appears after login)
- Check if menu is properly enabled
- Verify Tools menu is uncommented in menu.js

**Change Database Option Missing:**
- Verify menu.js has been updated correctly
- Check for JavaScript syntax errors
- Ensure preload.js APIs are properly exposed

**File Dialog Not Opening:**
- Check Electron permissions
- Verify main process IPC handler is registered
- Look for dialog-related errors in console

**Database Change Fails:**
- Verify selected file is a valid database
- Check file permissions and accessibility
- Ensure electron-store is properly initialized

### Debug Information:
```javascript
// Check current database path
const currentPath = await window.electronAPI.getDbPath();
console.log('Current database:', currentPath);

// Test change database API
const result = await window.electronAPI.changeDatabase();
console.log('Change result:', result);
```

## Performance Considerations

### Optimization Features:
- **Efficient File Validation**: Quick existence checks before processing
- **Minimal Memory Usage**: No database content loading during change
- **Fast Transitions**: Immediate path updates with deferred connection
- **Error Prevention**: Validation before storage updates

### Best Practices:
- Always validate files before updating storage
- Provide immediate feedback to users
- Handle large database files gracefully
- Implement proper error recovery

This feature provides a seamless way for users to switch between different database files, enhancing the flexibility and usability of the Guide Motor Training School application.