import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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
const auth = getAuth(app);

// Demo users data
const demoUsers = [
  {
    email: 'citizen@demo.com',
    password: 'demo123',
    name: 'Demo Citizen',
    type: 'citizen',
    personalBudget: 500
  },
  {
    email: 'driver@demo.com',
    password: 'demo123',
    name: 'Demo Driver',
    type: 'driver',
    temporalPassword: 'TEMP1234',
    licenseNumber: 'DL123456',
    department: 'Operations',
    monthlyFuelLimit: 1000
  }
];

// Demo vehicles
const demoVehicles = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    licensePlate: 'ABC-123',
    fuelType: 'gasoline',
    isActive: true,
    tankCapacity: 60,
    averageConsumption: 7.5,
    efficiencyScore: 85,
    status: 'active'
  },
  {
    make: 'Ford',
    model: 'Transit',
    year: 2021,
    licensePlate: 'XYZ-789',
    fuelType: 'diesel',
    isActive: false,
    tankCapacity: 80,
    averageConsumption: 9.2,
    efficiencyScore: 78,
    status: 'active'
  }
];

// Demo fuel stations
const demoFuelStations = [
  {
    name: 'Shell Station',
    brand: 'Shell',
    address: 'Main Street, Mbabane',
    location: { latitude: -26.3167, longitude: 31.1333 },
    distance: 0.5,
    prices: { gasoline: 6.80, diesel: 6.75, premium: 7.20 },
    lastUpdated: new Date(),
    amenities: ['Convenience Store', 'ATM', 'Car Wash'],
    operatingHours: { open: '06:00', close: '22:00' }
  },
  {
    name: 'Total Fuel',
    brand: 'Total',
    address: 'Commercial Street, Mbabane',
    location: { latitude: -26.3200, longitude: 31.1400 },
    distance: 1.2,
    prices: { gasoline: 6.75, diesel: 6.70, premium: 7.15 },
    lastUpdated: new Date(),
    amenities: ['Restaurant', 'Rest Area'],
    operatingHours: { open: '05:30', close: '23:00' }
  },
  {
    name: 'Engen Station',
    brand: 'Engen',
    address: 'Industrial Road, Mbabane',
    location: { latitude: -26.3100, longitude: 31.1250 },
    distance: 0.8,
    prices: { gasoline: 6.90, diesel: 6.85, premium: 7.30 },
    lastUpdated: new Date(),
    amenities: ['Convenience Store', 'Tire Service'],
    operatingHours: { open: '06:00', close: '21:00' }
  }
];

async function setupDemoData() {
  try {
    console.log('🚀 Setting up demo data...\n');

    // Create demo users
    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        const firebaseUser = userCredential.user;
        
        // Update profile
        await updateProfile(firebaseUser, { displayName: userData.name });
        
        // Create user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, {
          id: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          type: userData.type,
          personalBudget: userData.personalBudget || 0,
          temporalPassword: userData.temporalPassword,
          licenseNumber: userData.licenseNumber,
          department: userData.department,
          monthlyFuelLimit: userData.monthlyFuelLimit || 0,
          assignedVehicles: [],
          permissions: [],
          role: userData.type === 'driver' ? 'driver' : 'user',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
        
        // Create demo vehicles for this user
        for (const vehicleData of demoVehicles) {
          const vehicleRef = await addDoc(collection(db, 'vehicles'), {
            ...vehicleData,
            userId: firebaseUser.uid,
            name: `${vehicleData.make} ${vehicleData.model}`,
            plateNumber: vehicleData.licensePlate,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Created vehicle: ${vehicleData.make} ${vehicleData.model} for ${userData.name}`);
        }
        
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error);
        }
      }
    }

    // Create fuel stations
    console.log('\n⛽ Creating fuel stations...');
    for (const stationData of demoFuelStations) {
      try {
        const stationRef = await addDoc(collection(db, 'fuelStations'), {
          ...stationData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created fuel station: ${stationData.name}`);
      } catch (error) {
        console.error(`❌ Error creating fuel station ${stationData.name}:`, error);
      }
    }

    console.log('\n🎉 Demo data setup completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('Citizen: citizen@demo.com / demo123');
    console.log('Driver: driver@demo.com / demo123 (or temporal password: TEMP1234)');
    
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    process.exit(1);
  }
}

setupDemoData();