import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');

    // Test vehicles collection
    console.log('📦 Testing vehicles collection...');
    const vehiclesRef = collection(db, 'vehicles');
    const vehiclesSnapshot = await getDocs(vehiclesRef);
    console.log(`✅ Found ${vehiclesSnapshot.size} vehicles`);

    // Test drivers collection
    console.log('👥 Testing drivers collection...');
    const driversRef = collection(db, 'drivers');
    const driversSnapshot = await getDocs(driversRef);
    console.log(`✅ Found ${driversSnapshot.size} drivers`);

    // Test fuel logs collection
    console.log('⛽ Testing fuel logs collection...');
    const fuelLogsRef = collection(db, 'fuelLogs');
    const fuelLogsSnapshot = await getDocs(fuelLogsRef);
    console.log(`✅ Found ${fuelLogsSnapshot.size} fuel logs`);

    // Test budgets collection
    console.log('💰 Testing budgets collection...');
    const budgetsRef = collection(db, 'budgets');
    const budgetsSnapshot = await getDocs(budgetsRef);
    console.log(`✅ Found ${budgetsSnapshot.size} budgets`);

    console.log('🎉 All Firebase connections successful!');
    console.log('\n📊 Database Summary:');
    console.log(`- Vehicles: ${vehiclesSnapshot.size}`);
    console.log(`- Drivers: ${driversSnapshot.size}`);
    console.log(`- Fuel Logs: ${fuelLogsSnapshot.size}`);
    console.log(`- Budgets: ${budgetsSnapshot.size}`);

    // Show some sample data
    if (vehiclesSnapshot.size > 0) {
      const firstVehicle = vehiclesSnapshot.docs[0].data();
      console.log('\n🚗 Sample Vehicle:');
      console.log(`- Name: ${firstVehicle.name}`);
      console.log(`- Model: ${firstVehicle.model}`);
      console.log(`- Plate: ${firstVehicle.plateNumber}`);
      console.log(`- Department: ${firstVehicle.department}`);
    }

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    process.exit(1);
  }
}

testFirebaseConnection(); 