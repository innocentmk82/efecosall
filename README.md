# E-FECOS - Eswatini Fuel Efficiency and Cost Saving System

A comprehensive fuel optimization and fleet management system with both web and mobile applications.

## 🏗️ Project Structure

```
├── src/                    # Web Application (React + TypeScript)
├── mobileApp/             # Mobile Application (React Native + Expo)
├── shared/                # Shared code between web and mobile
│   ├── config/           # Firebase configuration
│   ├── services/         # Shared business logic
│   └── types/            # TypeScript type definitions
├── scripts/              # Database setup and utility scripts
└── firestore.rules       # Firestore security rules
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI (for mobile development)

### Setup

1. **Install dependencies for web app:**
```bash
npm install
```

2. **Install dependencies for mobile app:**
```bash
cd mobileApp
npm install
cd ..
```

3. **Setup demo data:**
```bash
npm run setup-demo
```

4. **Start web application:**
```bash
npm run dev
```

5. **Start mobile application:**
```bash
cd mobileApp
npm run dev
```

## 🔐 Authentication & User Types

### User Types
- **Citizens**: Personal fuel tracking, budget management
- **Drivers**: Company vehicle management, assigned budgets, trip tracking
- **Admins**: Full fleet management, driver oversight, analytics

### Demo Accounts
- **Citizen**: `citizen@demo.com` / `demo123`
- **Driver**: `driver@demo.com` / `demo123` or temporal password `TEMP1234`

## 📱 Mobile App Features

### For Citizens
- Personal vehicle management
- Fuel consumption tracking
- Budget monitoring
- Trip logging
- Fuel station finder with real-time prices

### For Drivers
- Company vehicle access
- Assigned budget tracking
- Trip management with OBD integration
- Real-time fuel monitoring
- Route optimization

## 🌐 Web App Features

### Business Management
- Driver registration and management
- Vehicle fleet oversight
- Budget allocation and monitoring
- Real-time analytics dashboard
- OBD device integration

### Analytics & Reporting
- Fuel efficiency trends
- Cost analysis
- Driver performance metrics
- Route optimization insights
- Anomaly detection

## 🔧 Technical Architecture

### Shared Backend
- **Firebase Authentication**: Unified auth across platforms
- **Firestore Database**: Real-time data synchronization
- **Security Rules**: Role-based access control

### Web Application
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization

### Mobile Application
- **React Native** with Expo
- **TypeScript** support
- **React Navigation** for routing
- **React Native Maps** for location features

## 📊 Database Collections

### Core Collections
- `users` - User profiles (citizens and drivers)
- `businesses` - Business information
- `businessUsers` - Business account users
- `drivers` - Driver-specific data
- `vehicles` - Vehicle information
- `trips` - Trip tracking data
- `fuelLogs` - Fuel consumption records
- `budgets` - Budget management
- `fuelStations` - Fuel station data

### Monitoring Collections
- `obdDevices` - OBD-II device data
- `obdAlerts` - Vehicle alerts and warnings
- `drivingBehavior` - Driver behavior analytics

## 🔒 Security Features

### Authentication
- Firebase Authentication integration
- Role-based access control
- Temporal passwords for drivers
- Session management

### Data Protection
- Firestore security rules
- User data isolation
- Business data segregation
- Encrypted sensitive information

## 🛠️ Development

### Available Scripts

**Web App:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run setup-demo` - Setup demo data

**Mobile App:**
- `npm run dev` - Start Expo development server
- `npm run build:web` - Build web version

**Database:**
- `npm run push-data` - Push sample data to Firebase
- `npm run test-db` - Test database connection

### Environment Configuration

The apps use shared Firebase configuration from `shared/config/firebase.ts`. No additional environment variables are required as the configuration is embedded.

## 📈 Features

### Real-time Monitoring
- Live OBD-II data integration
- Real-time fuel consumption tracking
- Vehicle status monitoring
- Driver behavior analysis

### Analytics & Insights
- Fuel efficiency trends
- Cost optimization recommendations
- Route performance analysis
- Anomaly detection and alerts

### Budget Management
- Department-wise budget allocation
- Real-time spending tracking
- Alert thresholds and notifications
- Monthly/weekly budget periods

### Mobile Features
- Offline data synchronization
- GPS-based fuel station finder
- Trip tracking with OBD integration
- Push notifications for alerts

## 🔄 Data Synchronization

Both web and mobile apps share the same Firebase backend, ensuring:
- Real-time data updates across platforms
- Consistent user experience
- Automatic conflict resolution
- Offline capability with sync on reconnection

## 🚗 OBD-II Integration

### Supported Features
- Real-time engine diagnostics
- Fuel consumption monitoring
- Vehicle performance metrics
- Maintenance alerts
- Driver behavior analysis

### Supported Devices
- ELM327 compatible adapters
- Bluetooth and WiFi OBD devices
- Professional fleet monitoring systems

## 📞 Support

For technical support or questions:
- Email: support@efecos.com
- Documentation: See individual README files in each directory
- Issues: Create GitHub issues for bug reports

## 📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both web and mobile
5. Submit a pull request

## 🔮 Roadmap

- [ ] Advanced AI route optimization
- [ ] Integration with fuel price APIs
- [ ] Fleet maintenance scheduling
- [ ] Carbon footprint tracking
- [ ] Multi-language support
- [ ] Advanced reporting and exports