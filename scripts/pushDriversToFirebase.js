import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPOA1FlioFWIXcw4NCQA8O72gynjj2KBs",
  authDomain: "efecos-538f7.firebaseapp.com",
  projectId: "efecos-538f7",
  storageBucket: "efecos-538f7.firebasestorage.app",
  messagingSenderId: "649177228733",
  appId: "1:649177228733:web:cfb3a1a9cd51ed4ad65ed4",
  measurementId: "G-FC0V6E8D1B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock Drivers Data
const mockDrivers = [
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    licenseNumber: 'DL123456',
    department: 'Operations',
    assignedVehicles: ['1'],
    efficiencyScore: 85,
    totalTrips: 156,
    totalDistance: 12500,
    totalFuelUsed: 1050,
    joinDate: '2022-03-15',
    obdDeviceId: 'OBD-001',
    phoneNumber: '+268 1234 5678',
    emergencyContact: 'Jane Smith - +268 1234 5679'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    licenseNumber: 'DL789012',
    department: 'Sales',
    assignedVehicles: ['2'],
    efficiencyScore: 92,
    totalTrips: 89,
    totalDistance: 7800,
    totalFuelUsed: 560,
    joinDate: '2023-01-10',
    obdDeviceId: 'OBD-002',
    phoneNumber: '+268 2345 6789',
    emergencyContact: 'Tom Johnson - +268 2345 6790'
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    licenseNumber: 'DL345678',
    department: 'Maintenance',
    assignedVehicles: ['3'],
    efficiencyScore: 78,
    totalTrips: 203,
    totalDistance: 18900,
    totalFuelUsed: 2280,
    joinDate: '2021-08-22',
    obdDeviceId: 'OBD-003',
    phoneNumber: '+268 3456 7890',
    emergencyContact: 'Lisa Wilson - +268 3456 7891'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    licenseNumber: 'DL901234',
    department: 'Operations',
    assignedVehicles: ['4'],
    efficiencyScore: 88,
    totalTrips: 134,
    totalDistance: 9800,
    totalFuelUsed: 720,
    joinDate: '2023-06-15',
    obdDeviceId: 'OBD-004',
    phoneNumber: '+268 4567 8901',
    emergencyContact: 'David Davis - +268 4567 8902'
  },
  {
    name: 'Robert Brown',
    email: 'robert.brown@company.com',
    licenseNumber: 'DL567890',
    department: 'Sales',
    assignedVehicles: ['5'],
    efficiencyScore: 91,
    totalTrips: 67,
    totalDistance: 5200,
    totalFuelUsed: 380,
    joinDate: '2023-09-20',
    obdDeviceId: 'OBD-005',
    phoneNumber: '+268 5678 9012',
    emergencyContact: 'Mary Brown - +268 5678 9013'
  }
];

async function pushDriversToFirebase() {
  try {
    console.log('🚀 Starting to push drivers to Firebase...\n');

    // Push drivers
    console.log('👥 Pushing drivers...');
    for (const driver of mockDrivers) {
      const docRef = await addDoc(collection(db, 'drivers'), {
        ...driver,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Driver "${driver.name}" added with ID: ${docRef.id}`);
    }

    console.log('\n🎉 All drivers successfully pushed to Firebase!');
    console.log(`📊 Total drivers pushed: ${mockDrivers.length}`);

  } catch (error) {
    console.error('❌ Error pushing drivers to Firebase:', error);
    process.exit(1);
  }
}

// Function to add a single driver
async function addSingleDriver(driverData) {
  try {
    const docRef = await addDoc(collection(db, 'drivers'), {
      ...driverData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Driver "${driverData.name}" added with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding driver:', error);
    throw error;
  }
}

// Function to add a new driver with custom data
async function addNewDriver() {
  const newDriver = {
    name: 'New Driver',
    email: 'new.driver@company.com',
    licenseNumber: 'DL999999',
    department: 'Operations',
    assignedVehicles: [],
    efficiencyScore: 85,
    totalTrips: 0,
    totalDistance: 0,
    totalFuelUsed: 0,
    joinDate: new Date().toISOString().split('T')[0],
    obdDeviceId: '',
    phoneNumber: '',
    emergencyContact: ''
  };

  try {
    await addSingleDriver(newDriver);
  } catch (error) {
    console.error('Failed to add new driver:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--new')) {
  addNewDriver();
} else {
  pushDriversToFirebase();
} 