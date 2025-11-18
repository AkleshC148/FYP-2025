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
async function getFirebaseSensorData(selectedZone) {
    
    // --- MODIFICATION ---
    // This assumes all data at the root belongs to "Zone 1"
    // and will return nothing for other zones.
    
    if (selectedZone !== "Zone 1") {
        console.log(`Data for ${selectedZone} is not available.`);
        return null;
    }

    // We fetch the ROOT of the database, not a specific path.
    const url = `https://agri-smart-63464-default-rtdb.asia-southeast1.firebasedatabase.app/.json?orderBy="$key"&limitToLast=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Firebase fetch failed (${response.status}): ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data) {
            console.log(`No sensor data found at the root.`);
            return null;
        }

        const latestReadingData = Object.values(data)[0];
        
        // Map it, but we MUST hard-code "Zone 1" as the zone_id
        return mapFirebaseToSchema(latestReadingData, "Zone 1");

    } catch (error) {
        console.error(`Error fetching from Firebase root:`, error.message);
        return null; 
    }
}


// --- Dashboard Action (MODIFIED) ---
export async function getDashboardData(selectedZone) {
  try {
    // We REPLACED 'SensorR.filter' with our new 'getFirebaseSensorData'
    const [healthRecords, systemAlerts] = await Promise.all([
//       getFirebaseSensorData(selectedZone), // <-- THIS IS THE CHANGE
      PlantHealthR.filter({ zone_id: selectedZone }, "-created_date", 1),
      SystemA.filter({ zone_id: selectedZone, resolved: false }, "-created_date", 5)
    ]);

    return serialize({
      sensorData: sensorData, // This is now your mapped Firebase data
      plantHealth: healthRecords[0] || null,
      alerts: systemAlerts
    });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return { error: error.message, sensorData: null, plantHealth: null, alerts: [] };
  }
}
// export async function getDashboardData(selectedZone) {
//   try {
//     const [sensorReads, healthRecords, systemAlerts] = await Promise.all([
//       SensorR.filter({ zone_id: selectedZone }, "-created_date", 1),
//       PlantHealthR.filter({ zone_id: selectedZone }, "-created_date", 1),
//       SystemA.filter({ zone_id: selectedZone, resolved: false }, "-created_date", 5)
//     ]);

//     return serialize({
//       sensorData: sensorReads[0] || null,
//       plantHealth: healthRecords[0] || null,
//       alerts: systemAlerts
//     });
//   } catch (error) {
//     console.error("Error in getDashboardData:", error);
//     return { error: error.message, sensorData: null, plantHealth: null, alerts: [] };
//   }
// }

// --- Analytics Action ---
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

// --- Plant Health Action ---
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

// You can add 'create', 'update', 'delete' actions here too
// export async function createNewAlert(formData) {
//   // ... logic to create an alert
// }

export async function getAlertsData(filter, severityFilter) {
  try {
    let query = {};
    
    // This logic is now securely on the server
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
    
    // Return success and the updated item
    return JSON.parse(JSON.stringify({ success: true, alert: updatedAlert }));
  } catch (error) {
    console.error("Error in resolveAlert:", error);
    return { error: error.message, success: false };
  }
}



//--- actions for irrigation page----
export async function getIrrigationPageData(selectedZone) {
  try {
    // 1. Fetch data for the page from two different entities
    const [events, sensors] = await Promise.all([
      IrrigationE.filter({ zone_id: selectedZone }, "-created_date", 10),
      SensorR.filter({ zone_id: selectedZone }, "-created_date", 1)
    ]);
    
    // 2. Return the serialized data
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
    // 1. Define the new event data on the server
    const eventData = {
      zone_id: selectedZone,
      event_type: action === "start" ? "pump_on" : "pump_off",
      trigger_reason: "Manual override",
      // This logic was in your component, so we move it here.
      // You might want to calculate the duration more accurately on "stop".
      duration_minutes: action === "start" ? null : 5 
    };

    // 2. Create the new irrigation event
    const newEvent = await IrrigationE.create(eventData);

    if (!newEvent) {
      throw new Error("Could not create irrigation event.");
    }
    
    // 3. Return success and the new event
    return serialize({ success: true, event: newEvent });

  } catch (error) {
    console.error("Error in triggerManualPump:", error);
    return { error: error.message, success: false };
  }
}


// --- STUB FUNCTIONS (for demonstration) ---
// You would replace these with your actual integrations.
// This logic MUST live on the server (i.e., be called from this actions.js file).

async function UploadFile(file) {
  // In a real app, this would upload the file to S3, Firebase Storage, etc.
  // and return the public URL.
  console.log(`[Server Action] "Uploading" file: ${file.name}`);
  // Simulating a file upload delay
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  // Return a placeholder URL
  return { file_url: `https://placeholder.storage.com/${Date.now()}_${file.name}` };
}

async function InvokeLLM(config) {
  // In a real app, this would call the Gemini API or another LLM.
  console.log(`[Server Action] "Analyzing" file: ${config.file_urls[0]}`);
  // Simulating an AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Return mock analysis based on the schema
  return {
    health_status: "diseased",
    disease_type: "Powdery Mildew",
    confidence_score: 85.5,
    recommendations: "Apply a fungicide and increase air circulation."
  };
}
// -------------------------------------------------------------------


// A helper to safely serialize data for the client
// function serialize(data) {
//   return JSON.parse(JSON.stringify(data));
// }

// ... (Your existing getDashboardData, getAnalyticsData, etc. actions are here) ...
// ... (getPlantHealthData, getAlertsData, resolveAlert) ...


// --- 🆕 ACTION FOR IMAGE UPLOAD & ANALYSIS ---

export async function analyzePlantImage(formData) {
  try {
    // 1. Get data from FormData
    const file = formData.get("file");
    const zone = formData.get("zone");

    if (!file || !zone) {
      throw new Error("File and zone are required.");
    }

    // 2. Upload image (Server-side operation)
    // This is where you'd call your actual file upload logic
    const { file_url } = await UploadFile(file);
    
    // 3. Analyze image with AI (Server-side operation)
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

    // 4. Save to database (Server-side operation)
    const newRecord = await PlantHealthR.create({
      zone_id: zone,
      image_url: file_url,
      health_status: analysis.health_status || "unknown",
      disease_type: analysis.disease_type || "N/A",
      confidence_score: analysis.confidence_score || 0,
      recommendations: analysis.recommendations || "No recommendations available."
    });

    // 5. Return success and the new record
    return serialize({ success: true, record: newRecord });

  } catch (error) {
    console.error("Error analyzing plant image:", error);
    return { error: error.message, success: false };
  }
}