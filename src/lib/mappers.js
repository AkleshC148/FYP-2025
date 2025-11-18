// This function can be used on the client AND server
export function mapFirebaseToSchema(firebaseData, zoneId) {
    if (!firebaseData) {
        return null;
    }

    // This object matches your 'SensorReadingSchema'
    return {
        zone_id: zoneId,
        soil_moisture: firebaseData.soil_percent || 1, // MAP: soil_percent -> soil_moisture
        temperature: firebaseData.temperature || 0,
        humidity: firebaseData.humidity || 0,

        // --- Default values for fields not in Firebase ---
        soil_ph: 6.8, // Example default
        nitrogen: 0,
        phosphorus: 5,
        potassium: 6,
        light_intensity: 23.5,
        wind_speed: 0,
        
        created_date: new Date().toISOString()
    };
}