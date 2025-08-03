import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Fuel, 
  TrendingUp, 
  Route, 
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Navigation,
  Calendar,
  Cloud,
  Wind,
  Thermometer
} from 'lucide-react';

interface OptimizationResult {
  originalRoute: {
    distance: number;
    estimatedTime: number;
    fuelConsumption: number;
    cost: number;
  };
  optimizedRoute: {
    distance: number;
    estimatedTime: number;
    fuelConsumption: number;
    cost: number;
    savings: {
      distance: number;
      time: number;
      fuel: number;
      cost: number;
    };
  };
  factors: {
    traffic: string;
    weather: string;
    roadConditions: string;
    fuelPrices: string;
  };
  recommendations: string[];
  alternativeRoutes: Array<{
    name: string;
    distance: number;
    time: number;
    fuelConsumption: number;
    advantages: string[];
    disadvantages: string[];
  }>;
}

interface AIRouteOptimizationProps {
  startLocation: string;
  endLocation: string;
  vehicleType: string;
  driverPreferences?: {
    avoidTolls: boolean;
    preferHighways: boolean;
    maxDistance: number;
  };
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

const AIRouteOptimization: React.FC<AIRouteOptimizationProps> = ({
  startLocation,
  endLocation,
  vehicleType,
  driverPreferences,
  onOptimizationComplete
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);

  const simulateOptimization = async (): Promise<OptimizationResult> => {
    // Simulate AI optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const baseDistance = 150;
    const baseTime = 120;
    const baseFuel = 12;
    const baseCost = 18;

    return {
      originalRoute: {
        distance: baseDistance,
        estimatedTime: baseTime,
        fuelConsumption: baseFuel,
        cost: baseCost
      },
      optimizedRoute: {
        distance: baseDistance * 0.85,
        estimatedTime: baseTime * 0.78,
        fuelConsumption: baseFuel * 0.82,
        cost: baseCost * 0.85,
        savings: {
          distance: baseDistance * 0.15,
          time: baseTime * 0.22,
          fuel: baseFuel * 0.18,
          cost: baseCost * 0.15
        }
      },
      factors: {
        traffic: 'Low traffic conditions detected',
        weather: 'Clear weather - optimal driving conditions',
        roadConditions: 'Good road conditions on primary route',
        fuelPrices: 'Current fuel price: $1.45/L'
      },
      recommendations: [
        'Use Highway A1 for 15% faster travel time',
        'Avoid downtown area during peak hours',
        'Consider refueling at station near km 78',
        'Monitor weather conditions for return trip'
      ],
      alternativeRoutes: [
        {
          name: 'Highway Route',
          distance: 127.5,
          time: 94,
          fuelConsumption: 9.8,
          advantages: ['Faster travel time', 'Less traffic', 'Better fuel efficiency'],
          disadvantages: ['Toll fees', 'Longer distance']
        },
        {
          name: 'Scenic Route',
          distance: 165,
          time: 140,
          fuelConsumption: 13.2,
          advantages: ['Beautiful scenery', 'No tolls', 'Rest stops available'],
          disadvantages: ['Longer travel time', 'Higher fuel consumption']
        },
        {
          name: 'City Route',
          distance: 142,
          time: 110,
          fuelConsumption: 11.4,
          advantages: ['Shortest distance', 'Multiple fuel stations', 'Urban amenities'],
          disadvantages: ['Heavy traffic', 'Frequent stops', 'Lower average speed']
        }
      ]
    };
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await simulateOptimization();
      setOptimizationResult(result);
      onOptimizationComplete?.(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Route Optimization</h2>
            <p className="text-purple-100">Intelligent route planning for maximum efficiency</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">From</span>
            </div>
            <p className="text-sm">{startLocation}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">To</span>
            </div>
            <p className="text-sm">{endLocation}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Navigation className="w-4 h-4" />
              <span className="text-sm font-medium">Vehicle</span>
            </div>
            <p className="text-sm">{vehicleType}</p>
          </div>
        </div>
      </div>

      {/* Optimization Button */}
      <div className="text-center">
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Optimizing Route...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Optimize Route with AI
            </div>
          )}
        </button>
      </div>

      {/* Results */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    {optimizationResult.optimizedRoute.savings.fuel.toFixed(1)}L
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Savings</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatTime(optimizationResult.optimizedRoute.savings.time)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Route className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance Saved</p>
                  <p className="text-lg font-bold text-purple-600">
                    {optimizationResult.optimizedRoute.savings.distance.toFixed(1)}km
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cost Savings</p>
                  <p className="text-lg font-bold text-orange-600">
                    {formatCurrency(optimizationResult.optimizedRoute.savings.cost)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Route Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Route Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Original Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Optimized Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Distance</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{optimizationResult.originalRoute.distance} km</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{optimizationResult.optimizedRoute.distance.toFixed(1)} km</td>
                    <td className="px-6 py-4 text-sm text-green-600">-{optimizationResult.optimizedRoute.savings.distance.toFixed(1)} km</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Time</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatTime(optimizationResult.originalRoute.estimatedTime)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatTime(optimizationResult.optimizedRoute.estimatedTime)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">-{formatTime(optimizationResult.optimizedRoute.savings.time)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Fuel Consumption</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{optimizationResult.originalRoute.fuelConsumption} L</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{optimizationResult.optimizedRoute.fuelConsumption.toFixed(1)} L</td>
                    <td className="px-6 py-4 text-sm text-green-600">-{optimizationResult.optimizedRoute.savings.fuel.toFixed(1)} L</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Cost</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(optimizationResult.originalRoute.cost)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(optimizationResult.optimizedRoute.cost)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">-{formatCurrency(optimizationResult.optimizedRoute.savings.cost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Environmental Factors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Factors</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Traffic Conditions</p>
                    <p className="text-sm text-gray-600">{optimizationResult.factors.traffic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Cloud className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weather</p>
                    <p className="text-sm text-gray-600">{optimizationResult.factors.weather}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Route className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Road Conditions</p>
                    <p className="text-sm text-gray-600">{optimizationResult.factors.roadConditions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Fuel className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fuel Prices</p>
                    <p className="text-sm text-gray-600">{optimizationResult.factors.fuelPrices}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-3">
                {optimizationResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Routes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alternative Routes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {optimizationResult.alternativeRoutes.map((route, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRoute === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRoute(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{route.name}</h4>
                    {selectedRoute === index && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-medium">{route.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(route.time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel:</span>
                      <span className="font-medium">{route.fuelConsumption} L</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">Advantages:</div>
                    <div className="space-y-1">
                      {route.advantages.map((advantage, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-700">{advantage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Export Route
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Apply Optimization
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Share Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRouteOptimization; 