# Database Scripts

This directory contains scripts for managing data in the Firebase database for the Fuel Optimization System.

## Available Scripts

### 1. `pushToFirebase.js`
**Purpose**: Pushes basic data (vehicles, drivers, fuel logs, budgets) to Firebase
**Usage**: 
```bash
node scripts/pushToFirebase.js
```

### 2. `pushAllDataToFirebase.js`
**Purpose**: Pushes all data types to Firebase including trips, OBD devices, and OBD alerts
**Usage**: 
```bash
node scripts/pushAllDataToFirebase.js
```

### 3. `pushDriversToFirebase.js`
**Purpose**: Dedicated script for managing drivers in the database
**Usage**: 
```bash
# Push all mock drivers
node scripts/pushDriversToFirebase.js

# Add a new driver (template)
node scripts/pushDriversToFirebase.js --new
```

### 4. `pushFuelLogsToFirebase.js`
**Purpose**: Dedicated script for managing fuel logs in the database
**Usage**: 
```bash
# Push all mock fuel logs
node scripts/pushFuelLogsToFirebase.js

# Add a new fuel log (template)
node scripts/pushFuelLogsToFirebase.js --new
```

### 5. `pushTripsToFirebase.js`
**Purpose**: Dedicated script for managing trips in the database
**Usage**: 
```bash
# Push all mock trips
node scripts/pushTripsToFirebase.js

# Add a new trip (template)
node scripts/pushTripsToFirebase.js --new
```

### 6. `testFirebase.js`
**Purpose**: Tests Firebase connection and basic operations
**Usage**: 
```bash
node scripts/testFirebase.js
```

## Data Types

The scripts handle the following data types:

### Drivers
- **Fields**: name, email, licenseNumber, department, assignedVehicles, efficiencyScore, totalTrips, totalDistance, totalFuelUsed, joinDate, obdDeviceId, phoneNumber, emergencyContact
- **Collection**: `drivers`

### Vehicles
- **Fields**: name, model, year, plateNumber, tankCapacity, averageConsumption, department, status, efficiencyScore, monthlyBudget, currentSpend, obdDeviceId, assignedDriverId, lastOBDUpdate
- **Collection**: `vehicles`

### Fuel Logs
- **Fields**: vehicleId, driverId, date, odometer, liters, cost, location, tripDistance, efficiency, route, isAnomalous, tag
- **Collection**: `fuelLogs`

### Budgets
- **Fields**: name, department, period, monthlyLimit, currentSpend, vehicleIds, alertThreshold
- **Collection**: `budgets`

### Trips
- **Fields**: vehicleId, driverId, startLocation, endLocation, startTime, endTime, distance, fuelUsed, cost, status, routeOptimization, tag
- **Collection**: `trips`

### OBD Devices
- **Fields**: deviceId, vehicleId, model, manufacturer, firmwareVersion, isConnected, lastSeen, signalStrength, batteryLevel, location
- **Collection**: `obdDevices`

### OBD Alerts
- **Fields**: vehicleId, type, category, title, message, severity, timestamp, isResolved
- **Collection**: `obdAlerts`

## Firebase Configuration

All scripts use the same Firebase configuration:
- **Project ID**: efecos-538f7
- **Database**: Firestore
- **Collections**: drivers, vehicles, fuelLogs, budgets, trips, obdDevices, obdAlerts

## Usage Examples

### Adding New Drivers
1. Edit the `mockDrivers` array in `pushDriversToFirebase.js`
2. Run the script:
   ```bash
   node scripts/pushDriversToFirebase.js
   ```

### Adding New Fuel Logs
1. Edit the `mockFuelLogs` array in `pushFuelLogsToFirebase.js`
2. Run the script:
   ```bash
   node scripts/pushFuelLogsToFirebase.js
   ```

### Adding New Trips
1. Edit the `mockTrips` array in `pushTripsToFirebase.js`
2. Run the script:
   ```bash
   node scripts/pushTripsToFirebase.js
   ```

### Adding All Data Types
1. Edit the mock data arrays in `pushAllDataToFirebase.js`
2. Run the script:
   ```bash
   node scripts/pushAllDataToFirebase.js
   ```

### Testing Database Connection
```bash
node scripts/testFirebase.js
```

## Notes

- All scripts automatically add `createdAt` and `updatedAt` timestamps
- Scripts will create new documents with unique IDs
- Existing data will not be overwritten (new documents will be created)
- Check the console output for success/error messages
- All scripts include error handling and detailed logging

## Driver Management in the App

The drivers page (`src/components/Drivers/DriverList.tsx`) is already connected to the database through:

1. **DataContext** (`src/context/DataContext.tsx`) - Provides data operations
2. **Firebase Service** (`src/services/firebaseService.ts`) - Handles database operations
3. **Real-time Updates** - Changes are reflected immediately in the UI

### Adding Drivers via the App
1. Navigate to the Drivers page
2. Click "Add New Driver"
3. Fill in the driver details
4. Click "Add Driver"

The driver will be automatically saved to Firebase and appear in the list.

### Features Available

#### Drivers Management
- ✅ Add new drivers
- ✅ Edit existing drivers
- ✅ Delete drivers
- ✅ Search and filter drivers
- ✅ View driver efficiency scores
- ✅ Assign vehicles to drivers
- ✅ Track driver performance metrics

#### Fuel Logs Management
- ✅ Add new fuel entries
- ✅ Edit existing fuel logs
- ✅ Delete fuel logs
- ✅ Search and filter by vehicle, driver, location
- ✅ Track fuel consumption and efficiency
- ✅ Detect anomalies automatically
- ✅ Real-time OBD integration
- ✅ Cost tracking and analysis

#### Trips Management
- ✅ Add new trips
- ✅ Edit existing trips
- ✅ Delete trips
- ✅ Search and filter by status, vehicle, tag
- ✅ Track trip performance and efficiency
- ✅ AI route optimization
- ✅ Real-time trip monitoring
- ✅ Multiple view modes (List, Map, Analytics, AI Optimization) 