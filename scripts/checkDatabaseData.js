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

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking Firebase database content...\n');

    const collections = [
      'drivers',
      'vehicles', 
      'fuelLogs',
      'budgets',
      'trips',
      'obdDevices',
      'obdAlerts'
    ];

    for (const collectionName of collections) {
      console.log(`📊 Checking ${collectionName} collection...`);
      
      const snapshot = await getDocs(collection(db, collectionName));
      
      if (snapshot.empty) {
        console.log(`   ❌ No documents found in ${collectionName}`);
      } else {
        console.log(`   ✅ Found ${snapshot.size} documents in ${collectionName}`);
        
        // Show first few documents as examples
        const docs = snapshot.docs.slice(0, 3);
        docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`      ${index + 1}. ID: ${doc.id}`);
          
          // Show key fields based on collection type
          switch (collectionName) {
            case 'drivers':
              console.log(`         Name: ${data.name || 'N/A'}`);
              console.log(`         Email: ${data.email || 'N/A'}`);
              console.log(`         Department: ${data.department || 'N/A'}`);
              break;
            case 'vehicles':
              console.log(`         Name: ${data.name || 'N/A'}`);
              console.log(`         Plate: ${data.plateNumber || 'N/A'}`);
              console.log(`         Department: ${data.department || 'N/A'}`);
              break;
            case 'fuelLogs':
              console.log(`         Vehicle: ${data.vehicleId || 'N/A'}`);
              console.log(`         Date: ${data.date || 'N/A'}`);
              console.log(`         Liters: ${data.liters || 'N/A'}`);
              break;
            case 'budgets':
              console.log(`         Name: ${data.name || 'N/A'}`);
              console.log(`         Department: ${data.department || 'N/A'}`);
              console.log(`         Limit: ${data.monthlyLimit || 'N/A'}`);
              break;
            case 'trips':
              console.log(`         From: ${data.startLocation || 'N/A'}`);
              console.log(`         To: ${data.endLocation || 'N/A'}`);
              console.log(`         Status: ${data.status || 'N/A'}`);
              break;
            case 'obdDevices':
              console.log(`         Device ID: ${data.deviceId || 'N/A'}`);
              console.log(`         Vehicle: ${data.vehicleId || 'N/A'}`);
              console.log(`         Connected: ${data.isConnected || 'N/A'}`);
              break;
            case 'obdAlerts':
              console.log(`         Title: ${data.title || 'N/A'}`);
              console.log(`         Type: ${data.type || 'N/A'}`);
              console.log(`         Severity: ${data.severity || 'N/A'}`);
              break;
          }
        });
        
        if (snapshot.size > 3) {
          console.log(`      ... and ${snapshot.size - 3} more documents`);
        }
      }
      console.log('');
    }

    console.log('✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
}

checkDatabaseData(); 