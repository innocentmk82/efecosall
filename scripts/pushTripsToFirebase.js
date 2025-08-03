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

// Mock Trips Data
const mockTrips = [
  {
    vehicleId: '1',
    driverId: '1',
    startLocation: 'Warehouse A',
    endLocation: 'Customer Site B',
    startTime: '2024-03-15T08:00:00Z',
    endTime: '2024-03-15T10:30:00Z',
    distance: 45.2,
    fuelUsed: 22.1,
    cost: 33.15,
    status: 'Completed',
    routeOptimization: 'Optimized',
    tag: 'Business'
  },
  {
    vehicleId: '2',
    driverId: '2',
    startLocation: 'Office',
    endLocation: 'Client Meeting',
    startTime: '2024-03-14T09:00:00Z',
    endTime: '2024-03-14T11:00:00Z',
    distance: 28.7,
    fuelUsed: 15.5,
    cost: 23.25,
    status: 'Completed',
    routeOptimization: 'Standard',
    tag: 'Delivery'
  },
  {
    vehicleId: '3',
    driverId: '3',
    startLocation: 'Maintenance Site',
    endLocation: 'Construction Site',
    startTime: '2024-03-15T07:30:00Z',
    endTime: '2024-03-15T12:00:00Z',
    distance: 78.5,
    fuelUsed: 22.1,
    cost: 33.15,
    status: 'In Progress',
    routeOptimization: 'Optimized',
    tag: 'Maintenance'
  },
  {
    vehicleId: '1',
    driverId: '1',
    startLocation: 'Customer Site C',
    endLocation: 'Warehouse A',
    startTime: '2024-03-16T14:00:00Z',
    endTime: '2024-03-16T16:30:00Z',
    distance: 32.5,
    fuelUsed: 18.2,
    cost: 27.30,
    status: 'Planned',
    routeOptimization: 'Manual',
    tag: 'Delivery'
  },
  {
    vehicleId: '2',
    driverId: '2',
    startLocation: 'Client Site D',
    endLocation: 'Office',
    startTime: '2024-03-17T10:00:00Z',
    endTime: '2024-03-17T12:00:00Z',
    distance: 35.8,
    fuelUsed: 19.5,
    cost: 29.25,
    status: 'Planned',
    routeOptimization: 'Standard',
    tag: 'Business'
  },
  {
    vehicleId: '3',
    driverId: '3',
    startLocation: 'Equipment Depot',
    endLocation: 'Construction Site',
    startTime: '2024-03-18T06:00:00Z',
    endTime: '2024-03-18T11:00:00Z',
    distance: 65.2,
    fuelUsed: 28.7,
    cost: 43.05,
    status: 'Planned',
    routeOptimization: 'Optimized',
    tag: 'Maintenance'
  },
  {
    vehicleId: '1',
    driverId: '1',
    startLocation: 'Distribution Center',
    endLocation: 'Customer Site E',
    startTime: '2024-03-19T08:30:00Z',
    endTime: '2024-03-19T11:00:00Z',
    distance: 52.1,
    fuelUsed: 25.3,
    cost: 37.95,
    status: 'Planned',
    routeOptimization: 'Optimized',
    tag: 'Business'
  },
  {
    vehicleId: '2',
    driverId: '2',
    startLocation: 'Office',
    endLocation: 'Client Site F',
    startTime: '2024-03-20T09:00:00Z',
    endTime: '2024-03-20T11:30:00Z',
    distance: 42.3,
    fuelUsed: 20.1,
    cost: 30.15,
    status: 'Planned',
    routeOptimization: 'Standard',
    tag: 'Delivery'
  }
];

async function pushTripsToFirebase() {
  try {
    console.log('🚀 Starting to push trips to Firebase...\n');

    // Push trips
    console.log('🚗 Pushing trips...');
    for (const trip of mockTrips) {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...trip,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Trip from ${trip.startLocation} to ${trip.endLocation} added with ID: ${docRef.id}`);
    }

    console.log('\n🎉 All trips successfully pushed to Firebase!');
    console.log(`📊 Total trips pushed: ${mockTrips.length}`);

    // Calculate statistics
    const totalDistance = mockTrips.reduce((sum, trip) => sum + trip.distance, 0);
    const totalFuelUsed = mockTrips.reduce((sum, trip) => sum + trip.fuelUsed, 0);
    const totalCost = mockTrips.reduce((sum, trip) => sum + trip.cost, 0);
    const completedTrips = mockTrips.filter(trip => trip.status === 'Completed').length;
    const inProgressTrips = mockTrips.filter(trip => trip.status === 'In Progress').length;
    const plannedTrips = mockTrips.filter(trip => trip.status === 'Planned').length;
    const optimizedTrips = mockTrips.filter(trip => trip.routeOptimization === 'Optimized').length;

    console.log('\n📈 Summary Statistics:');
    console.log(`   • Total distance: ${totalDistance.toFixed(1)}km`);
    console.log(`   • Total fuel used: ${totalFuelUsed.toFixed(1)}L`);
    console.log(`   • Total cost: E${totalCost.toFixed(2)}`);
    console.log(`   • Completed trips: ${completedTrips}`);
    console.log(`   • In progress trips: ${inProgressTrips}`);
    console.log(`   • Planned trips: ${plannedTrips}`);
    console.log(`   • AI optimized trips: ${optimizedTrips}`);
    console.log(`   • Average efficiency: ${((totalFuelUsed / totalDistance) * 100).toFixed(1)}L/100km`);

  } catch (error) {
    console.error('❌ Error pushing trips to Firebase:', error);
    process.exit(1);
  }
}

// Function to add a single trip
async function addSingleTrip(tripData) {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Trip from ${tripData.startLocation} to ${tripData.endLocation} added with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding trip:', error);
    throw error;
  }
}

// Function to add a new trip with custom data
async function addNewTrip() {
  const newTrip = {
    vehicleId: '1',
    driverId: '1',
    startLocation: 'New Start Location',
    endLocation: 'New End Location',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    distance: 25.0,
    fuelUsed: 12.5,
    cost: 18.75,
    status: 'Planned',
    routeOptimization: 'Standard',
    tag: 'Business'
  };

  try {
    await addSingleTrip(newTrip);
  } catch (error) {
    console.error('Failed to add new trip:', error);
  }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--new')) {
  addNewTrip();
} else {
  pushTripsToFirebase();
} 