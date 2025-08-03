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

// Mock Fuel Logs Data
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
  },
  {
    vehicleId: '1',
    driverId: '1',
    date: '2024-03-10',
    odometer: 44200,
    liters: 50.0,
    cost: 75.00,
    location: 'Galp Nhlangano',
    tripDistance: 52.1,
    efficiency: 8.8,
    route: 'Warehouse A to Distribution Center',
    isAnomalous: true,
    anomalyReason: 'Higher than average consumption for route',
    tag: 'Maintenance'
  },
  {
    vehicleId: '3',
    driverId: '3',
    date: '2024-03-12',
    odometer: 18900,
    liters: 65.0,
    cost: 97.50,
    location: 'Shell Ezulwini',
    tripDistance: 78.5,
    efficiency: 12.1,
    route: 'Maintenance Site to Equipment Depot',
    isAnomalous: false,
    tag: 'Maintenance'
  },
  {
    vehicleId: '2',
    driverId: '2',
    date: '2024-03-13',
    odometer: 32000,
    liters: 42.5,
    cost: 63.75,
    location: 'TotalEnergies Mbabane',
    tripDistance: 35.8,
    efficiency: 7.8,
    route: 'Client Meeting to Office',
    isAnomalous: false,
    tag: 'Business'
  },
  {
    vehicleId: '1',
    driverId: '1',
    date: '2024-03-11',
    odometer: 44000,
    liters: 38.0,
    cost: 57.00,
    location: 'Engen Manzini',
    tripDistance: 32.5,
    efficiency: 8.2,
    route: 'Customer Site C to Warehouse A',
    isAnomalous: false,
    tag: 'Delivery'
  },
  {
    vehicleId: '3',
    driverId: '3',
    date: '2024-03-09',
    odometer: 18500,
    liters: 55.0,
    cost: 82.50,
    location: 'Galp Nhlangano',
    tripDistance: 65.2,
    efficiency: 11.8,
    route: 'Equipment Depot to Construction Site',
    isAnomalous: false,
    tag: 'Maintenance'
  },
  {
    vehicleId: '2',
    driverId: '2',
    date: '2024-03-08',
    odometer: 31500,
    liters: 33.5,
    cost: 50.25,
    location: 'Shell Ezulwini',
    tripDistance: 28.1,
    efficiency: 7.1,
    route: 'Office to Client Site D',
    isAnomalous: false,
    tag: 'Business'
  }
];

async function pushFuelLogsToFirebase() {
  try {
    console.log('🚀 Starting to push fuel logs to Firebase...\n');

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

    console.log('\n🎉 All fuel logs successfully pushed to Firebase!');
    console.log(`📊 Total fuel logs pushed: ${mockFuelLogs.length}`);

    // Calculate statistics
    const totalLiters = mockFuelLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = mockFuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalDistance = mockFuelLogs.reduce((sum, log) => sum + log.tripDistance, 0);
    const anomalies = mockFuelLogs.filter(log => log.isAnomalous).length;

    console.log('\n📈 Summary Statistics:');
    console.log(`   • Total fuel used: ${totalLiters.toFixed(1)}L`);
    console.log(`   • Total cost: E${totalCost.toFixed(2)}`);
    console.log(`   • Total distance: ${totalDistance.toFixed(1)}km`);
    console.log(`   • Anomalies detected: ${anomalies}`);
    console.log(`   • Average efficiency: ${((totalLiters / totalDistance) * 100).toFixed(1)}L/100km`);

  } catch (error) {
    console.error('❌ Error pushing fuel logs to Firebase:', error);
    process.exit(1);
  }
}

// Function to add a single fuel log
async function addSingleFuelLog(fuelLogData) {
  try {
    const docRef = await addDoc(collection(db, 'fuelLogs'), {
      ...fuelLogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Fuel log for vehicle ${fuelLogData.vehicleId} added with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding fuel log:', error);
    throw error;
  }
}

// Function to add a new fuel log with custom data
async function addNewFuelLog() {
  const newFuelLog = {
    vehicleId: '1',
    driverId: '1',
    date: new Date().toISOString().split('T')[0],
    odometer: 45000,
    liters: 40.0,
    cost: 60.00,
    location: 'TotalEnergies Mbabane',
    tripDistance: 35.0,
    efficiency: 8.5,
    route: 'New Route',
    isAnomalous: false,
    tag: 'Business'
  };

  try {
    await addSingleFuelLog(newFuelLog);
  } catch (error) {
    console.error('Failed to add new fuel log:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--new')) {
  addNewFuelLog();
} else {
  pushFuelLogsToFirebase();
} 