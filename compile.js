const fs = require('fs');
const solc = require('solc');
const path = require('path');

const contractPath = path.join(__dirname, 'contracts', 'IoTDataLogger.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'IoTDataLogger.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode']
            }
        }
    }
};

console.log('Compiling contract...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
    output.errors.forEach(error => {
        console.error(error.formattedMessage);
    });
    if (output.errors.some(error => error.severity === 'error')) {
        process.exit(1);
    }
}

const contract = output.contracts['IoTDataLogger.sol']['IoTDataLogger'];

const contractData = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
};

fs.writeFileSync(
    'compiled-contract.json',
    JSON.stringify(contractData, null, 2)
);

console.log('✅ Contract compiled successfully!');