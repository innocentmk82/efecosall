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

const mockVehicles = [
  {
    name: 'Ford Transit',
    model: 'Transit',
    year: 2022,
    plateNumber: 'ABC-123',
    tankCapacity: 80,
    averageConsumption: 8.5,
    department: 'Operations',
    status: 'active',
    efficiencyScore: 85,
    monthlyBudget: 1200,
    currentSpend: 850,
    obdDeviceId: 'OBD-001',
    assignedDriverId: '1',
    lastOBDUpdate: new Date().toISOString()
  },
  {
    name: 'Toyota Camry',
    model: 'Camry',
    year: 2023,
    plateNumber: 'XYZ-789',
    tankCapacity: 60,
    averageConsumption: 7.2,
    department: 'Sales',
    status: 'active',
    efficiencyScore: 92,
    monthlyBudget: 800,
    currentSpend: 620,
    obdDeviceId: 'OBD-002',
    assignedDriverId: '2',
    lastOBDUpdate: new Date().toISOString()
  },
  {
    name: 'Chevrolet Silverado',
    model: 'Silverado',
    year: 2021,
    plateNumber: 'DEF-456',
    tankCapacity: 100,
    averageConsumption: 12.1,
    department: 'Maintenance',
    status: 'maintenance',
    efficiencyScore: 78,
    monthlyBudget: 1500,
    currentSpend: 1200,
    obdDeviceId: 'OBD-003',
    assignedDriverId: '3',
    lastOBDUpdate: new Date().toISOString()
  }
];

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
  }
];

const mockFuelLogs = [
  {
    vehicleId: '1',
    driverId: '1',
    date: '2024-03-15',
    odometer: 44800,
    liters: 45.5,
    cost: 68.25,
    location: 'TotalEnergies Mbabane',
    tripDistance: 45.2,
    efficiency: 8.5,
    route: 'Warehouse A to Customer Site B',
    isAnomalous: false,
    tag: 'Business'
  },
  {
    vehicleId: '2',
    driverId: '2',
    date: '2024-03-14',
    odometer: 31850,
    liters: 35.0,
    cost: 42.00,
    location: 'Engen Manzini',
    tripDistance: 28.7,
    efficiency: 7.2,
    route: 'Office to Client Meeting',
    isAnomalous: false,
    tag: 'Delivery'
  }
];

const mockBudgets = [
  {
    name: 'Operations Budget',
    department: 'Operations',
    period: 'monthly',
    monthlyLimit: 4000,
    currentSpend: 2670,
    vehicleIds: ['1'],
    alertThreshold: 80
  },
  {
    name: 'Sales Budget',
    department: 'Sales',
    period: 'monthly',
    monthlyLimit: 3000,
    currentSpend: 1850,
    vehicleIds: ['2'],
    alertThreshold: 75
  }
];

async function pushDataToFirebase() {
  try {
    console.log('🚀 Starting to push data to Firebase...');

    // Push vehicles
    console.log('📦 Pushing vehicles...');
    for (const vehicle of mockVehicles) {
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Vehicle "${vehicle.name}" added with ID: ${docRef.id}`);
    }

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

    // Push fuel logs
    console.log('⛽ Pushing fuel logs...');
    for (const fuelLog of mockFuelLogs) {
      const docRef = await addDoc(collection(db, 'fuelLogs'), {
        ...fuelLog,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Fuel log for vehicle ${fuelLog.vehicleId} added with ID: ${docRef.id}`);
    }

    // Push budgets
    console.log('💰 Pushing budgets...');
    for (const budget of mockBudgets) {
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Budget "${budget.name}" added with ID: ${docRef.id}`);
    }

    console.log('🎉 All data successfully pushed to Firebase!');

  } catch (error) {
    console.error('❌ Error pushing data to Firebase:', error);
    process.exit(1);
  }
}

pushDataToFirebase(); 