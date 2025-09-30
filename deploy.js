const { Web3 } = require('web3');
const fs = require('fs');

async function deploy() {
    const web3 = new Web3('http://127.0.0.1:8545');
    const contractData = JSON.parse(fs.readFileSync('compiled-contract.json', 'utf8'));
    const accounts = await web3.eth.getAccounts();
    
    console.log('Deploying from:', accounts[0]);
    
    const contract = new web3.eth.Contract(contractData.abi);
    
    console.log('Deploying contract...');
    const deployedContract = await contract
        .deploy({ data: '0x' + contractData.bytecode })
        .send({ from: accounts[0], gas: 3000000 });
    
    const address = deployedContract.options.address;
    console.log('✅ Contract deployed to:', address);
    
    fs.writeFileSync(
        'contract-info.json',
        JSON.stringify({
            address: address,
            abi: contractData.abi
        }, null, 2)
    );
    
    console.log('📄 Saved to contract-info.json');
}

deploy().catch(console.error);