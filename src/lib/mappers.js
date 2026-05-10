export function mapFirebaseToSchema(firebaseData, zoneId) {
    if (!firebaseData) {
        return null;
    }

    return {
        zone_id: zoneId,
        soil_moisture: firebaseData.soil_percent || 1,
        temperature: firebaseData.temperature || 0,
        humidity: firebaseData.humidity || 0,
        soil_ph: 6.8,
        nitrogen: 0,
        phosphorus: 5,
        potassium: 6,
        light_intensity: 23.5,
        wind_speed: 0,
        
        created_date: new Date().toISOString()
    };
}