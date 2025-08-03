import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_DEFAULT = Maps.PROVIDER_DEFAULT;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

// Web-compatible map components using react-leaflet
let WebMapView: any = null;
let WebMarker: any = null;

if (Platform.OS === 'web') {
  try {
    // For now, use a simple fallback since React Native doesn't support div elements
    WebMapView = ({ style, children, ...props }: any) => {
      return (
        <View style={[style, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Interactive map available on mobile</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>Fuel stations are listed below</Text>
        </View>
      );
    };

    WebMarker = ({ coordinate, title, description, pinColor }: any) => {
      return null; // Don't render anything on web
    };
  } catch (error) {
    console.warn('react-leaflet not available:', error);
  }
}

interface FuelStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  distance: string;
}

interface MapComponentProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  fuelStations: FuelStation[];
  style?: any;
}

// Fallback web map component
const FallbackWebMapView = ({ style, children, ...props }: any) => {
  return (
    <View style={[style, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#6B7280', fontSize: 16 }}>Map view not available on web</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>Use mobile app for full map features</Text>
    </View>
  );
};

// Fallback web marker component
const FallbackWebMarker = ({ coordinate, title, description, pinColor }: any) => {
  return null; // Don't render anything on web
};

export const MapComponent: React.FC<MapComponentProps> = ({ userLocation, fuelStations, style }) => {
  // Use platform-specific components
  const PlatformMapView = Platform.OS === 'web' ? (WebMapView || FallbackWebMapView) : MapView;
  const PlatformMarker = Platform.OS === 'web' ? (WebMarker || FallbackWebMarker) : Marker;
  const PlatformProviderDefault = Platform.OS === 'web' ? null : PROVIDER_DEFAULT;

  if (!PlatformMapView) {
    return (
      <View style={[style, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#6B7280', fontSize: 16 }}>Map view not available</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>Use mobile app for full map features</Text>
      </View>
    );
  }

  return (
    <PlatformMapView
      style={style}
      provider={PlatformProviderDefault}
      initialRegion={{
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
      mapType="standard"
    >
      {fuelStations.map((station) => (
        <PlatformMarker
          key={station.id}
          coordinate={{
            latitude: station.latitude,
            longitude: station.longitude,
          }}
          title={station.name}
          description={`E${station.price}/L • ${station.distance}`}
          pinColor="#059669"
        />
      ))}
    </PlatformMapView>
  );
}; 