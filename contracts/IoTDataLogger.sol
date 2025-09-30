// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IoTDataLogger {
    struct SensorData {
        uint256 timestamp;
        string sensorId;
        int256 temperature;
    }
    
    SensorData[] public dataRecords;
    
    event DataLogged(
        uint256 indexed recordId,
        string sensorId,
        int256 temperature,
        uint256 timestamp
    );
    
    function logData(string memory _sensorId, int256 _temperature) public {
        dataRecords.push(SensorData({
            timestamp: block.timestamp,
            sensorId: _sensorId,
            temperature: _temperature
        }));
        
        emit DataLogged(
            dataRecords.length - 1,
            _sensorId,
            _temperature,
            block.timestamp
        );
    }
    
    function getRecordCount() public view returns (uint256) {
        return dataRecords.length;
    }
    
    function getRecord(uint256 _index) public view returns (
        uint256 timestamp,
        string memory sensorId,
        int256 temperature
    ) {
        require(_index < dataRecords.length, "Record does not exist");
        SensorData memory record = dataRecords[_index];
        return (record.timestamp, record.sensorId, record.temperature);
    }
}