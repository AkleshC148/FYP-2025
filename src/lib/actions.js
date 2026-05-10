"use server"; // 👈 Most important line: Marks all functions in this file as Server Actions

import { SensorR } from "@/lib/entities/SensorReading"; // Your existing DB logic
import { PlantHealthR } from "@/lib/entities/PlantHealthRecord"; // Your existing DB logic
import { SystemA } from "@/lib/entities/SystemAlert"; // Your existing DB logic
import { IrrigationE } from "@/lib/entities/IrrigationEvent"; // Your existing DB logic

// A helper to safely serialize data for the client
function serialize(data) {
  return JSON.parse(JSON.stringify(data));
}

// --- Dashboard Action ---


// --- HELPER FUNCTION: Fetches latest sensor data from Firebase ---
// --- HELPER FUNCTION: Fetches latest sensor data from Firebase ---
// async function getFirebaseSensorData(selectedZone) {
    
//     // --- MODIFICATION ---
//     // This assumes all data at the root belongs to "Zone 1"
//     // and will return nothing for other zones.
    
//     if (selectedZone !== "Zone 1") {
//         console.log(`Data for ${selectedZone} is not available.`);
//         return null;
//     }

//     // We fetch the ROOT of the database, not a specific path.
//     const url = `https://agri-smart-63464-default-rtdb.asia-southeast1.firebasedatabase.app/.json?orderBy="$key"&limitToLast=1`;

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error(`Firebase fetch failed (${response.status}): ${response.statusText}`);
//         }
        
//         const data = await response.json();
        
//         if (!data) {
//             console.log(`No sensor data found at the root.`);
//             return null;
//         }

//         const latestReadingData = Object.values(data)[0];
        
//         // Map it, but we MUST hard-code "Zone 1" as the zone_id
//         return mapFirebaseToSchema(latestReadingData, "Zone 1");

//     } catch (error) {
//         console.error(`Error fetching from Firebase root:`, error.message);
//         return null; 
//     }
// }

export async function getDashboardData(selectedZone) {
 try {
  const [healthRecords, systemAlerts] = await Promise.all([
  PlantHealthR.filter({ zone_id: selectedZone }, "-created_date", 1),
  SystemA.filter({ zone_id: selectedZone, resolved: false }, "-created_date", 5)
 ]);

  return serialize({
    plantHealth: healthRecords[0] || null,
    alerts: systemAlerts
  });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return { error: error.message, sensorData: null, plantHealth: null, alerts: [] };
  }
}

export async function getAnalyticsData(selectedZone, timeRange) {
  try {
    const limit = timeRange === "24h" ? 24 : timeRange === "7d" ? 50 : 100;
    
    const [sensors, irrigation, alerts] = await Promise.all([
      SensorR.filter({ zone_id: selectedZone }, "-created_date", limit),
      IrrigationE.filter({ zone_id: selectedZone }, "-created_date", limit),
      SystemA.filter({ zone_id: selectedZone }, "-created_date", limit)
    ]);
    
    return serialize({
      sensorData: sensors,
      irrigationData: irrigation,
      alertData: alerts
    });
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    return { error: error.message, sensorData: [], irrigationData: [], alertData: [] };
  }
}

export async function getPlantHealthData(selectedZone) {
  try {
    const records = await PlantHealthR.filter(
      { zone_id: selectedZone }, 
      "-created_date", 
      10
    );
    return serialize({ records });
  } catch (error) {
    console.error("Error in getPlantHealthData:", error);
    return { error: error.message, records: [] };
  }
}


export async function getAlertsData(filter, severityFilter) {
  try {
    let query = {};
    if (filter === "active") {
      query.resolved = false;
    } else if (filter === "resolved") {
      query.resolved = true;
    }
    
    if (severityFilter !== "all") {
      query.severity = severityFilter;
    }

    const alertsData = await SystemA.filter(query, "-created_date", 50);
    return JSON.parse(JSON.stringify({ alerts: alertsData }));
  } catch (error) {
    console.error("Error in getAlertsData:", error);
    return { error: error.message, alerts: [] };
  }
}

export async function resolveAlert(alertId) {
  try {
    const updatedAlert = await SystemA.update(alertId, { 
      resolved: true, 
      resolved_at: new Date().toISOString() 
    });

    if (!updatedAlert) {
      throw new Error("Alert not found or could not be updated.");
    }

    return JSON.parse(JSON.stringify({ success: true, alert: updatedAlert }));
  } catch (error) {
    console.error("Error in resolveAlert:", error);
    return { error: error.message, success: false };
  }
}


export async function getIrrigationPageData(selectedZone) {
  try {
    const [events, sensors] = await Promise.all([
      IrrigationE.filter({ zone_id: selectedZone }, "-created_date", 10),
      SensorR.filter({ zone_id: selectedZone }, "-created_date", 1)
    ]);
    
    return serialize({
      irrigationEvents: events,
      sensorData: sensors[0] || null
    });
  } catch (error) {
    console.error("Error in getIrrigationPageData:", error);
    return { error: error.message, irrigationEvents: [], sensorData: null };
  }
}

export async function triggerManualPump(selectedZone, action) {
  try {
    const eventData = {
      zone_id: selectedZone,
      event_type: action === "start" ? "pump_on" : "pump_off",
      trigger_reason: "Manual override",
      duration_minutes: action === "start" ? null : 5 
    };

    const newEvent = await IrrigationE.create(eventData);

    if (!newEvent) {
      throw new Error("Could not create irrigation event.");
    }
    return serialize({ success: true, event: newEvent });

  } catch (error) {
    console.error("Error in triggerManualPump:", error);
    return { error: error.message, success: false };
  }
}

async function UploadFile(file) {
  console.log(`[Server Action] "Uploading" file: ${file.name}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  return { file_url: `https://placeholder.storage.com/${Date.now()}_${file.name}` };
}

async function InvokeLLM(config) {
  console.log(`[Server Action] "Analyzing" file: ${config.file_urls[0]}`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    health_status: "diseased",
    disease_type: "Powdery Mildew",
    confidence_score: 85.5,
    recommendations: "Apply a fungicide and increase air circulation."
  };
}

export async function analyzePlantImage(formData) {
  try {
    const file = formData.get("file");
    const zone = formData.get("zone");

    if (!file || !zone) {
      throw new Error("File and zone are required.");
    }

    const { file_url } = await UploadFile(file);

    const analysisPrompt = `
      Analyze this plant image for health status and diseases.
      Look for signs of:
      - Leaf discoloration or spots
      - Wilting or drooping
      - Pest damage
      - Fungal infections
      - Nutrient deficiencies
      
      Determine if the plant is healthy or has issues.
      If diseased, identify the specific disease type.
      Provide actionable recommendations.
    `;

    const analysis = await InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          health_status: {
            type: "string", 
            enum: ["healthy", "diseased", "warning", "unknown"]
          },
          disease_type: { type: "string" },
          confidence_score: { 
            type: "number",
            minimum: 0,
            maximum: 100
          },
          recommendations: { type: "string" }
        }
      }
    });

    const newRecord = await PlantHealthR.create({
      zone_id: zone,
      image_url: file_url,
      health_status: analysis.health_status || "unknown",
      disease_type: analysis.disease_type || "N/A",
      confidence_score: analysis.confidence_score || 0,
      recommendations: analysis.recommendations || "No recommendations available."
    });

    return serialize({ success: true, record: newRecord });

  } catch (error) {
    console.error("Error analyzing plant image:", error);
    return { error: error.message, success: false };
  }
}