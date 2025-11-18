"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import React, { useState, useEffect, useCallback } from "react";
import { getDashboardData } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  FlaskConical
} from "lucide-react";

import { db } from "@/lib/firebase"; // Your Firebase config
import { ref, query, onValue, orderByKey, limitToLast } from "firebase/database";
import { mapFirebaseToSchema } from "@/lib/mappers"; // Your new mapper function

import ZoneSelector from "@/components/dashboard/ZoneSelector";
import SensorCard from "@/components/dashboard/SensorCard";
import PlantHealthWidget from "@/components/dashboard/PlantHealthWidget";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import QuickStats from "@/components/dashboard/QuickStats";

export default function Dashboard() {
  const [selectedZone, setSelectedZone] = useState("Zone 1");
  const [sensorData, setSensorData] = useState(null);
  const [plantHealth, setPlantHealth] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true); // We still set loading here
    try {
      // 🔽 MODIFIED: sensorData is no longer here
      const { plantHealth, alerts, error } = await getDashboardData(selectedZone);
      if (error) {
        throw new Error(error);
      }
      // 🔽 MODIFIED: We no longer set sensorData here
      setPlantHealth(plantHealth);
      setAlerts(alerts);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    // 🔽 We will set loading to false in the *other* hook
    // setLoading(false); 
  }, [selectedZone]);

  // 🔽 --- NEW, CORRECTED VERSION ---
  useEffect(() => {
    setLoading(true); // Set loading true when zone changes
    setSensorData(null); // Clear old sensor data

    // This variable will hold our listener so we can unsubscribe
    let unsubscribe = () => {};

    // --- THIS IS THE NEW LOGIC ---
    // Only listen for data if "Zone 1" is selected,
    // since all root data belongs to Zone 1.
    if (selectedZone === "Zone 1") {
      
      const sensorRef = ref(db, '/field_data');
      // 2. The query is the same (get the last item from the root)
      const lastItemQuery = query(sensorRef, orderByKey(), limitToLast(1));

      // 3. Set up the listener
      unsubscribe = onValue(lastItemQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // data is { "-OdNq...": { humidity: 98, ... } }
          const latestReadingData = Object.values(data)[0];
          // Map it, and hard-code "Zone 1" as the zoneId
          setSensorData(mapFirebaseToSchema(latestReadingData, "Zone 1"));
        } else {
          // No data found at the root
          setSensorData(null);
        }
        setLoading(false); // Set loading to false after data is fetched
      });

    } else {
      // If "Zone 2" or "Zone 3" is selected, show no sensor data
      // and stop loading.
      setSensorData(null);
      setLoading(false);
    }
    // --- END OF NEW LOGIC ---
     // Cleanup: This function is called when the component unmounts
    // or when 'selectedZone' changes, preventing memory leaks.
    return () => unsubscribe();
    
  }, [selectedZone]); // Re-subscribe if the zone changes

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const zones = ["Zone 1", "Zone 2", "Zone 3"];

  return (
    <ProtectedRoute>
    <div className="p-4 md:p-8 bg-gradient-to-br from-green-50 via-blue-50 to-green-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Farm Dashboard
            </h1>
            <p className="text-green-600 mt-2">Real-time monitoring and intelligent insights</p>
          </div>
          
          <div className="flex items-center gap-4">
            <ZoneSelector 
              zones={zones}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
            />
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-xl border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium text-sm">Live</span>
            </div>
          </div>
        </div>

        <QuickStats 
          sensorData={sensorData}
          plantHealth={plantHealth}
          alerts={alerts}
          loading={loading}
        />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <SensorCard
                title="Soil Moisture"
                value={sensorData?.soil_moisture}
                unit="%"
                icon={Droplets}
                color="blue"
                optimal={{ min: 40, max: 70 }}
                loading={loading}
              />
              <SensorCard
                title="Temperature"
                value={sensorData?.temperature}
                unit="°C"
                icon={Thermometer}
                color="red"
                optimal={{ min: 20, max: 30 }}
                loading={loading}
              />
              <SensorCard
                title="Humidity"
                value={sensorData?.humidity}
                unit="%"
                icon={Wind}
                color="green"
                optimal={{ min: 50, max: 80 }}
                loading={loading}
              />
              <SensorCard
                title="Light Intensity"
                value={sensorData?.light_intensity}
                unit="lux"
                icon={Sun}
                color="yellow"
                optimal={{ min: 200, max: 800 }}
                loading={loading}
              />
            </div>

            <Card className="bg-white/70 backdrop-blur border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-green-800">
                  <FlaskConical className="w-5 h-5" />
                  Soil Analysis - NPK Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="text-2xl font-bold text-blue-700">
                      {sensorData?.nitrogen || 0}
                    </div>
                    <div className="text-blue-600 font-medium">Nitrogen (N)</div>
                    <div className="text-xs text-blue-500 mt-1">mg/kg</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="text-2xl font-bold text-purple-700">
                      {sensorData?.phosphorus || 0}
                    </div>
                    <div className="text-purple-600 font-medium">Phosphorus (P)</div>
                    <div className="text-xs text-purple-500 mt-1">mg/kg</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                    <div className="text-2xl font-bold text-orange-700">
                      {sensorData?.potassium || 0}
                    </div>
                    <div className="text-orange-600 font-medium">Potassium (K)</div>
                    <div className="text-xs text-orange-500 mt-1">mg/kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PlantHealthWidget 
              plantHealth={plantHealth}
              loading={loading}
            />
            
            <RecentAlerts 
              alerts={alerts}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
