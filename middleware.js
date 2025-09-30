const express = require('express');
const { Web3 } = require('web3');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Ganache
const web3 = new Web3('http://127.0.0.1:8545');

// Load contract info
const contractInfo = JSON.parse(fs.readFileSync('contract-info.json', 'utf8'));
const contract = new web3.eth.Contract(contractInfo.abi, contractInfo.address);

let senderAccount;

async function initialize() {
    const accounts = await web3.eth.getAccounts();
    senderAccount = accounts[0];
    console.log('Using account:', senderAccount);
}

// Helper function to convert BigInt to string
function convertBigInt(obj) {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Middleware running',
        contract: contractInfo.address 
    });
});

// Log IoT data to blockchain
app.post('/api/log-data', async (req, res) => {
    try {
        const { sensorId, temperature } = req.body;
        
        if (!sensorId || temperature === undefined) {
            return res.status(400).json({
                error: 'Missing sensorId or temperature'
            });
        }
        
        console.log(`📝 Logging: ${sensorId} = ${temperature}°C`);
        
        const receipt = await contract.methods
            .logData(sensorId, Math.round(temperature))
            .send({ 
                from: senderAccount,
                gas: 3000000 
            });
        
        console.log('✅ Saved to blockchain!');
        console.log('Transaction:', receipt.transactionHash);
        
        // Convert BigInt values to strings before sending response
        res.json({
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString()
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get total records
app.get('/api/records/count', async (req, res) => {
    try {
        const count = await contract.methods.getRecordCount().call();
        res.json({ count: count.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific record
app.get('/api/records/:index', async (req, res) => {
    try {
        const index = req.params.index;
        const record = await contract.methods.getRecord(index).call();
        
        res.json({
            timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
            sensorId: record.sensorId,
            temperature: record.temperature.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all records
app.get('/api/records', async (req, res) => {
    try {
        const count = await contract.methods.getRecordCount().call();
        const records = [];
        
        for (let i = 0; i < count; i++) {
            const record = await contract.methods.getRecord(i).call();
            records.push({
                id: i,
                timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
                sensorId: record.sensorId,
                temperature: record.temperature.toString()
            });
        }
        
        res.json({ count: count.toString(), records });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Middleware server running on http://localhost:${PORT}`);
        console.log(`📦 Contract: ${contractInfo.address}\n`);
    });
});