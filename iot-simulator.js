const axios = require('axios');

const MIDDLEWARE_URL = 'http://localhost:3000';

async function sendSensorData() {
    const sensors = ['SENSOR_1', 'SENSOR_2', 'SENSOR_3', 'SENSOR_4', 'SENSOR_5'];
    const sensorId = sensors[Math.floor(Math.random() * sensors.length)];
    const temperature = (Math.random() * 30 + 15).toFixed(1); // 15-45°C
    
    try {
        console.log(`\n📡 ${new Date().toLocaleTimeString()} - Sending: ${sensorId} = ${temperature}°C`);
        
        const response = await axios.post(`${MIDDLEWARE_URL}/api/log-data`, {
            sensorId,
            temperature: parseFloat(temperature)
        });
        
        console.log(`✅ Success! TX: ${response.data.transactionHash.substring(0, 10)}...`);
        console.log(`📦 Block: ${response.data.blockNumber}`);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.error || error.message);
    }
}

console.log('🌡️  IoT Sensor Simulator Started');
console.log('Sending temperature data every 5 seconds...\n');

// Send immediately, then every 5 seconds
sendSensorData();
setInterval(sendSensorData, 5000);