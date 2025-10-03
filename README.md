# Guide Motor Training School Management System

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/balotiyash/guide-mts-electron)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-37.3.0-47848f.svg)](https://electronjs.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/balotiyash/guide-mts-electron)

A comprehensive desktop application for managing motor training school operations, built with Electron and SQLite.

## 🏆 Overview

Guide Motor Training School Management System (Guide MTS) is a robust desktop application designed specifically for motor training schools to manage their daily operations efficiently. The system provides comprehensive tools for managing students, instructors, vehicles, payments, and generating official documents.

### Key Features

- **📊 Dashboard Analytics** - Real-time insights into school operations
- **👥 Student Management** - Complete student lifecycle management
- **🚗 Vehicle Management** - Track cars, fuel consumption, and maintenance
- **💰 Payment Tracking** - Comprehensive fee management system
- **📄 Document Generation** - Official forms and receipts
- **🔐 Secure Authentication** - Role-based access control
- **💾 Database Management** - Backup and restore capabilities
- **📱 Responsive Design** - Optimized for various screen sizes

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Electron
- **Database**: SQLite3 with Better-SQLite3
- **Build Tool**: Electron Builder
- **UI Libraries**: 
  - Flatpickr (Date picker)
  - Chart.js (Analytics)
  - Custom CSS Grid/Flexbox layouts

## 📋 Prerequisites

Before installing Guide MTS, ensure you have:

- **Node.js** (version 16.0 or higher)
- **npm** (comes with Node.js)
- **Windows 10/11**, **macOS 10.15+**, or **Ubuntu 18.04+**
- **SQLite3** support (included with the application)

## 🚀 Installation

### For End Users (Production)

1. **Download the installer** from the [releases page](https://github.com/balotiyash/guide-mts-electron/releases)
2. **Run the installer** and follow the setup wizard
3. **Launch Guide MTS** from your desktop or start menu

### For Developers (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/balotiyash/guide-mts-electron.git
   cd guide-mts-electron
   ```

2. **Install dependencies**
   ```bash
   cd main-application
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run dist
   ```

## 📁 Project Structure

```
guide-mts/
├── main-application/          # Main Electron application
│   ├── src/
│   │   ├── assets/           # Images, icons, and media files
│   │   │   ├── icons/        # Application icons (multiple sizes)
│   │   │   ├── images/       # UI images and logos
│   │   │   ├── gifs/         # Loading animations
│   │   │   └── svgs/         # Vector graphics
│   │   ├── database/         # SQLite database files
│   │   ├── scripts/          # JavaScript modules
│   │   │   ├── main.js       # Main Electron process
│   │   │   ├── preload.js    # Preload scripts (security layer)
│   │   │   ├── menu.js       # Application menu configuration
│   │   │   ├── logger.js     # Logging utilities
│   │   │   ├── imports/      # Third-party libraries
│   │   │   └── renderer/     # Renderer process scripts
│   │   ├── styles/           # CSS stylesheets
│   │   │   ├── shared.css    # Global styles
│   │   │   ├── dashboard.css # Dashboard specific styles
│   │   │   └── *.css         # Page-specific styles
│   │   └── views/            # HTML pages
│   │       ├── index.html    # Login page
│   │       ├── dashboard.html # Main dashboard
│   │       ├── master_entry.html # Master data entry
│   │       ├── data_entry.html   # Student data entry
│   │       ├── payment_entry.html # Payment management
│   │       ├── car_entry.html    # Vehicle management
│   │       ├── fuel_entry.html   # Fuel tracking
│   │       ├── form14.html       # Form 14 generation
│   │       └── invoice.html      # Invoice generation
│   ├── package.json          # Node.js dependencies and scripts
│   └── data.json            # Application configuration
├── guide-db-migration/       # Database migration tools
│   ├── Schema Structure/     # Database schema documentation
│   ├── insert_*.ipynb      # Jupyter notebooks for data migration
│   └── csv_data_old/        # Legacy data files
└── README.md               # This file
```

## 🔧 Core Features

### 1. Authentication System
- **Secure Login**: Username/password authentication
- **Session Management**: Automatic logout on inactivity
- **Role-based Access**: Different permission levels

### 2. Dashboard Analytics
- **Revenue Tracking**: Monthly and yearly revenue analysis
- **Student Statistics**: Active students, new enrollments
- **Vehicle Utilization**: Car usage and fuel consumption
- **Payment Status**: Outstanding fees and collection reports

### 3. Student Management
- **Registration**: Complete student onboarding process
- **Profile Management**: Personal details, contact information
- **License Tracking**: Learning and permanent license management
- **Progress Monitoring**: Training progress and milestones

### 4. Instructor Management
- **Staff Registry**: Instructor profiles and qualifications
- **Schedule Management**: Class assignments and availability
- **Performance Tracking**: Student feedback and ratings

### 5. Vehicle Management
- **Fleet Tracking**: Car inventory and specifications
- **Maintenance Records**: Service history and schedules
- **Fuel Management**: Consumption tracking and costs
- **Insurance Tracking**: Policy details and renewals

### 6. Payment System
- **Fee Collection**: Multiple payment methods support
- **Invoice Generation**: Professional invoices and receipts
- **Payment History**: Complete transaction records
- **Outstanding Reports**: Pending payments tracking

### 7. Document Generation
- **Form 14**: Official government forms
- **Receipts**: Payment confirmations
- **Reports**: Custom business reports
- **Export Options**: PDF and print capabilities

## 🎯 Usage Guide

### First Time Setup

1. **Launch the application**
2. **Login** with default credentials (admin/admin)
3. **Change default password** in settings
4. **Configure database** location if needed
5. **Import existing data** (if migrating)

### Daily Operations

#### Adding a New Student
1. Navigate to **Data Entry** → **Student Entry**
2. Fill in personal details, contact information
3. Upload student photograph
4. Assign instructor and vehicle
5. Set training schedule and fees

#### Recording Payments
1. Go to **Payment Entry**
2. Select student from dropdown
3. Enter payment amount and method
4. Generate receipt
5. Print or save receipt

#### Generating Form 14
1. Navigate to **Form 14** section
2. Select date range and students
3. Preview generated form
4. Print or export as PDF

#### Managing Vehicles
1. Access **Car Entry** section
2. Add vehicle details and specifications
3. Track fuel consumption
4. Schedule maintenance

### Database Operations

#### Backup Database
1. Go to **Dashboard**
2. Click **Backup** button
3. Choose save location
4. Confirm backup creation

#### Change Database
1. Click **Tools** → **Change Database**
2. Confirm database switch
3. Select new database file
4. Application will reload automatically

## 🔧 Configuration

### Database Configuration
The application uses SQLite3 for data storage. Database location can be configured through:
- Initial setup wizard
- Tools → Change Database menu
- Configuration files

### Application Settings
Settings can be modified in:
- `data.json` - Application configuration
- Electron Store - User preferences
- Menu → Settings (when implemented)

## 🛡️ Security Features

- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **File System Security**: Sandboxed file access
- **Data Encryption**: Secure storage of sensitive data
- **Audit Trails**: Complete operation logging

## 📊 Database Schema

The application uses a comprehensive SQLite database with the following main tables:

- **students** - Student information and enrollment details
- **instructors** - Staff information and qualifications
- **cars** - Vehicle inventory and specifications
- **payments** - Financial transactions and fee records
- **fuel** - Fuel consumption and costs
- **jobs** - Work descriptions and categories
- **images** - Student photographs and documents

For detailed schema information, see `guide-db-migration/Schema Structure/`

## 🔨 Development

### Development Setup
```bash
# Clone repository
git clone https://github.com/balotiyash/guide-mts-electron.git

# Install dependencies
cd main-application
npm install

# Start development
npm start
```

### Building
```bash
# Build for current platform
npm run dist

# Build for specific platform
npm run dist -- --win    # Windows
npm run dist -- --mac    # macOS
npm run dist -- --linux  # Linux
```

### Code Style
- **ES6+ JavaScript** for modern syntax
- **CSS Grid/Flexbox** for layouts
- **Semantic HTML5** for accessibility
- **Modular architecture** for maintainability

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Check Node.js version (16+ required)
- Verify all dependencies are installed
- Check for antivirus blocking

**Database errors**
- Ensure database file exists and is readable
- Check file permissions
- Verify SQLite3 installation

**Print issues**
- Check printer connectivity
- Verify print CSS media queries
- Test with different browsers

**Performance issues**
- Close unnecessary applications
- Check available disk space
- Update to latest version

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=* npm start
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](license.txt) file for details.

## 👨‍💻 Author

**Yash Balotiya**
- GitHub: [@balotiyash](https://github.com/balotiyash)
- Company: AlgoDevOpss
- Email: [Contact through GitHub]

## 🙏 Acknowledgments

- **Electron Team** for the excellent framework
- **SQLite Team** for the robust database engine
- **Open Source Community** for various libraries and tools
- **Motor Training Schools** for requirements and feedback

## 📞 Support

For support and questions:
- Create an issue on [GitHub Issues](https://github.com/balotiyash/guide-mts-electron/issues)
- Check the documentation in this README
- Review the troubleshooting section

## 🗺️ Roadmap

### Version 1.4.0 (Planned)
- [ ] Advanced reporting features
- [ ] Email integration for receipts
- [ ] Mobile companion app
- [ ] Cloud synchronization
- [ ] Multi-language support

### Version 1.5.0 (Future)
- [ ] Online payment integration
- [ ] Student portal
- [ ] Advanced analytics
- [ ] API for third-party integrations
- [ ] Automated backups

---

**Made with ❤️ for Motor Training Schools**

*Guide MTS - Streamlining motor training school operations since 2025*