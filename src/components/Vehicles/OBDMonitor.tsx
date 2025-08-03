import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Gauge, 
  Zap, 
  Thermometer, 
  Droplets, 
  Battery, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Settings,
  RefreshCw,
  Power,
  PowerOff
} from 'lucide-react';
import { OBDData, OBDAlert, Vehicle } from '../../types';

interface OBDMonitorProps {
  vehicle: Vehicle;
  onConnectOBD?: (deviceId: string) => void;
  onDisconnectOBD?: () => void;
}

const OBDMonitor: React.FC<OBDMonitorProps> = ({ 
  vehicle, 
  onConnectOBD, 
  onDisconnectOBD 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [liveOBDData, setLiveOBDData] = useState<OBDData | null>(vehicle.obdData || null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'disconnecting'>(
    vehicle.obdData?.isConnected ? 'connected' : 'disconnected'
  );

  const isConnected = connectionStatus === 'connected';

  // Real-time data simulation
  useEffect(() => {
    if (!isConnected || !liveOBDData) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Simulate realistic data changes
      setLiveOBDData(prev => {
        if (!prev) return prev;
        
        const now = new Date();
        const timeOfDay = now.getHours();
        const isDaytime = timeOfDay >= 6 && timeOfDay <= 20;
        
        return {
          ...prev,
          // Engine RPM - varies based on time and random factors
          engineRPM: prev.engineRPM > 0 ? 
            Math.max(0, prev.engineRPM + (Math.random() - 0.5) * 200) : 
            (Math.random() > 0.95 ? 800 + Math.random() * 400 : 0),
          
          // Engine temperature - realistic thermal behavior
          engineTemperature: prev.engineRPM > 0 ? 
            Math.min(110, Math.max(25, prev.engineTemperature + (Math.random() - 0.5) * 2)) :
            Math.max(25, prev.engineTemperature - 0.5),
          
          // Fuel level - gradually decreases when engine is running
          fuelLevel: prev.engineRPM > 0 ? 
            Math.max(0, prev.fuelLevel - (Math.random() * 0.1)) :
            prev.fuelLevel,
          
          // Vehicle speed - realistic driving patterns
          vehicleSpeed: prev.engineRPM > 0 ? 
            Math.max(0, Math.min(120, prev.vehicleSpeed + (Math.random() - 0.5) * 5)) :
            Math.max(0, prev.vehicleSpeed - 2),
          
          // Battery voltage - realistic charging behavior
          batteryVoltage: prev.engineRPM > 0 ? 
            Math.min(14.5, Math.max(12.0, prev.batteryVoltage + (Math.random() - 0.5) * 0.1)) :
            Math.max(11.5, prev.batteryVoltage - 0.02),
          
          // Throttle position - realistic driving input
          throttlePosition: prev.engineRPM > 0 ? 
            Math.max(0, Math.min(100, prev.throttlePosition + (Math.random() - 0.5) * 10)) :
            0,
          
          // Trip distance - increases when moving
          tripDistance: prev.vehicleSpeed > 0 ? 
            prev.tripDistance + (prev.vehicleSpeed / 3600) : // km/h to km/s
            prev.tripDistance,
          
          // Odometer - increases with movement
          odometer: prev.vehicleSpeed > 0 ? 
            prev.odometer + (prev.vehicleSpeed / 3600) :
            prev.odometer,
          
          // Signal strength - varies slightly
          signalStrength: Math.max(70, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 5)),
          
          // Update timestamps
          timestamp: now.toISOString(),
          lastUpdate: now.toISOString()
        };
      });
    }, 1000); // Update every second for real-time feel

    return () => clearInterval(interval);
  }, [isConnected, liveOBDData]);

  // Simulate connection process
  const handleConnectOBD = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    // Simulate connection steps
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnecting(false);
      
      // Initialize live data
      const initialData: OBDData = {
        engineRPM: 0,
        engineLoad: 0,
        engineTemperature: 25,
        coolantTemperature: 22,
        oilTemperature: 24,
        oilPressure: 0,
        fuelLevel: 75,
        fuelConsumption: vehicle.averageConsumption,
        fuelFlowRate: 0,
        fuelPressure: 0,
        vehicleSpeed: 0,
        odometer: vehicle.obdData?.odometer || 0,
        tripDistance: 0,
        throttlePosition: 0,
        brakePressure: 0,
        acceleration: 0,
        idleTime: 0,
        checkEngineLight: false,
        diagnosticTroubleCodes: [],
        emissionStatus: 'pass',
        batteryVoltage: 12.6,
        alternatorVoltage: 0,
        transmissionTemperature: 22,
        gearPosition: 0,
        ambientTemperature: 22,
        barometricPressure: 1013,
        timestamp: new Date().toISOString(),
        isConnected: true,
        signalStrength: 85 + Math.random() * 15,
        lastUpdate: new Date().toISOString()
      };
      
      setLiveOBDData(initialData);
      
      if (onConnectOBD) {
        onConnectOBD(`OBD-${vehicle.id.padStart(3, '0')}`);
      }
    }, 2000);
  };

  // Simulate disconnection process
  const handleDisconnectOBD = async () => {
    setIsDisconnecting(true);
    setConnectionStatus('disconnecting');
    
    // Simulate disconnection steps
    setTimeout(() => {
      setConnectionStatus('disconnected');
      setIsDisconnecting(false);
      setLiveOBDData(null);
      
      if (onDisconnectOBD) {
        onDisconnectOBD();
      }
    }, 1500);
  };

  const getStatusColor = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value <= thresholds.low) return 'text-green-600';
    if (value <= thresholds.medium) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value: number, thresholds: { low: number; medium: number; high: number }) => {
    if (value <= thresholds.low) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (value <= thresholds.medium) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connecting': return 'Connecting...';
      case 'connected': return 'Connected';
      case 'disconnecting': return 'Disconnecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connecting': return 'text-yellow-600';
      case 'connected': return 'text-green-600';
      case 'disconnecting': return 'text-orange-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (connectionStatus === 'disconnected' && !vehicle.obdDeviceId) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">OBD-II Device</h4>
              <p className="text-sm text-gray-500">Not connected</p>
            </div>
          </div>
          <button
            onClick={handleConnectOBD}
            disabled={isConnecting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isConnecting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect OBD'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">OBD-II Monitor</h4>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                  connectionStatus === 'disconnecting' ? 'bg-orange-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </span>
                {isConnected && (
                  <span className="text-xs text-gray-500">
                    • Last update: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {isConnected ? (
              <button
                onClick={handleDisconnectOBD}
                disabled={isDisconnecting}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {isDisconnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )}
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            ) : (
              <button
                onClick={handleConnectOBD}
                disabled={isConnecting}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Power className="w-4 h-4" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected && liveOBDData && (
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Signal Strength */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Signal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${liveOBDData.signalStrength}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round(liveOBDData.signalStrength)}%</span>
              </div>
            </div>

            {/* Device ID */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Device ID</span>
              </div>
              <span className="text-sm font-mono">{vehicle.obdDeviceId}</span>
            </div>

            {/* Last Update */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Last Update</span>
              </div>
              <span className="text-sm">{lastUpdate.toLocaleTimeString()}</span>
            </div>

            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>

          {/* Real-time Status Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{liveOBDData.engineRPM > 0 ? 'ON' : 'OFF'}</span>
                {liveOBDData.engineRPM > 0 && (
                  <span className="text-sm text-blue-600">{Math.round(liveOBDData.engineRPM)} RPM</span>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Fuel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{Math.round(liveOBDData.fuelLevel)}%</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      liveOBDData.fuelLevel > 25 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${liveOBDData.fuelLevel}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Battery className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Battery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{liveOBDData.batteryVoltage.toFixed(1)}V</span>
                {getStatusIcon(liveOBDData.batteryVoltage, { low: 12.0, medium: 11.5, high: 11.0 })}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Engine Temp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{Math.round(liveOBDData.engineTemperature)}°C</span>
                {getStatusIcon(liveOBDData.engineTemperature, { low: 80, medium: 95, high: 110 })}
              </div>
            </div>
          </div>

          {/* Expandable Detailed Data */}
          {isExpanded && (
            <div className="space-y-4">
              {/* Engine Data */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Engine Data
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">RPM</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Math.round(liveOBDData.engineRPM).toLocaleString()}</span>
                      {getStatusIcon(liveOBDData.engineRPM, { low: 2000, medium: 4000, high: 6000 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Engine Load</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Math.round(liveOBDData.engineLoad)}%</span>
                      {getStatusIcon(liveOBDData.engineLoad, { low: 50, medium: 75, high: 90 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Engine Temp</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{Math.round(liveOBDData.engineTemperature)}°C</span>
                      {getStatusIcon(liveOBDData.engineTemperature, { low: 80, medium: 95, high: 110 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Oil Pressure</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{liveOBDData.oilPressure.toFixed(1)} bar</span>
                      {getStatusIcon(liveOBDData.oilPressure, { low: 1.5, medium: 2.5, high: 4.0 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fuel System */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Fuel System
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Fuel Level</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            liveOBDData.fuelLevel > 25 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${liveOBDData.fuelLevel}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{Math.round(liveOBDData.fuelLevel)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Consumption</span>
                    <span className="font-medium">{liveOBDData.fuelConsumption.toFixed(1)} L/100km</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Flow Rate</span>
                    <span className="font-medium">{liveOBDData.fuelFlowRate.toFixed(1)} L/h</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Pressure</span>
                    <span className="font-medium">{liveOBDData.fuelPressure.toFixed(1)} kPa</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Data */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Vehicle Data
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Speed</span>
                    <span className="font-medium">{Math.round(liveOBDData.vehicleSpeed)} km/h</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Odometer</span>
                    <span className="font-medium">{Math.round(liveOBDData.odometer).toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Trip Distance</span>
                    <span className="font-medium">{liveOBDData.tripDistance.toFixed(1)} km</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Gear</span>
                    <span className="font-medium">{liveOBDData.gearPosition}</span>
                  </div>
                </div>
              </div>

              {/* Electrical System */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Electrical System
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Battery Voltage</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{liveOBDData.batteryVoltage.toFixed(1)}V</span>
                      {getStatusIcon(liveOBDData.batteryVoltage, { low: 12.0, medium: 11.5, high: 11.0 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Alternator</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{liveOBDData.alternatorVoltage.toFixed(1)}V</span>
                      {getStatusIcon(liveOBDData.alternatorVoltage, { low: 13.5, medium: 13.0, high: 12.5 })}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Check Engine</span>
                    <div className="flex items-center gap-2">
                      {liveOBDData.checkEngineLight ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium">
                        {liveOBDData.checkEngineLight ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Emission Status</span>
                    <span className={`font-medium ${
                      liveOBDData.emissionStatus === 'pass' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {liveOBDData.emissionStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Performance Metrics
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Throttle Position</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${liveOBDData.throttlePosition}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{Math.round(liveOBDData.throttlePosition)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Brake Pressure</span>
                    <span className="font-medium">{liveOBDData.brakePressure.toFixed(1)} kPa</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Acceleration</span>
                    <span className="font-medium">{liveOBDData.acceleration.toFixed(1)} m/s²</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Idle Time</span>
                    <span className="font-medium">{Math.floor(liveOBDData.idleTime / 60)}m {liveOBDData.idleTime % 60}s</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OBDMonitor; 