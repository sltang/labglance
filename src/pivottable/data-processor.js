import fs from 'fs';

const collectionNames = ['OLCDSDA_Session',
   'OLCDSDA_Topology',
    'OLCDSDA_Performance',
    'OLCDSINST_Session',
    'OLCDSINST_Instrument',
    'OLCDSACQ_Session',
    'OLCDSACQ_Topology',
    'OLCDSACQ_Instrument',
    'OLCDSACQ_Performance',
    'OLCDSINST_Topology'
]

let data
let collections
let machineTable = []
let machinePivotTable = []
let instrumentPivotTable = []

const parseData = () => {
    let raw = fs.readFileSync('analytics.json', 'UTF-8')
    raw = '[' + raw.replace(/(.*)\r\n/g, '$1,')
    raw = raw.replace(/(.*),$/, '$1')
    raw += ']'

    data = JSON.parse(raw);
    return data;
}

const getCollections = () => {
    parseData()
    collections = groupByCollection(data, "CollectionName")
    return collections
}

export const getMachinePivotTable = () => {
    if (machinePivotTable.length === 0) {
        getCollections()
        //get PC details from OLCDSDA_Session 
        let das = groupBy(collections['OLCDSDA_Session'], "machinename")
        let pcDetails = groupBy(collections['OLCDSACQ_Session'], "machinename");
        let numDrives = 0
        let numPlugins = 0
        
        Object.keys(pcDetails).forEach(machineName => {
            let machineData = pcDetails[machineName];
            machineData.sort((r1, r2) => {
                if (r1.timestampatorigin === r2.timestampatorigin) return 0;
                return r1.timestampatorigin < r2.timestampatorigin ? 1 : -1;
            });
            let machine = machineData[0]
            if (machine.drives.length > numDrives) {
                numDrives = machine.drives.length
            }
            if (machine.plugins.length > numPlugins) {
                numPlugins = machine.plugins.length
            }
            let da
            if (das.hasOwnProperty(machineName)) {
                da = das[machineName].sort((r1, r2) => {
                    if (r1.timestampatorigin === r2.timestampatorigin) return 0;
                    return r1.timestampatorigin < r2.timestampatorigin ? 1 : -1;
                })[0]
            } 
            machineTable.push({
                machinename:machine.machinename, domain:machine.domain, osplatform:machine.osplatform, osversion:machine.osversion, language:machine.language, 
                processorcount:machine.processorcount, memory:machine.memory, manufacturer:machine.manufacturer, serialnumber:machine.serialnumber, 
                model:machine.model, cpuname1:machine.cpuname1, activesecurityproducts:machine.activesecurityproducts, 
                'applongname.0':machine.applongname, 'appversion.0':machine.appversion, 'installationdirectory.0':machine.installationdirectory, 
                'applongname.1':da?da.applongname:'', 'appversion.1':da?da.appversion:'', 'installationdirectory.1':da?da.installationdirectory:'',
                drives:machine.drives, plugins:machine.plugins
            })
        })

        //set drives and plugins
        let keys = Object.keys(machineTable[0].drives[0].Properties)
        let pluginsKeys = Object.keys(machineTable[0].plugins[0].Properties)
        machineTable.forEach(machine => {
            for (let i=0;i < numDrives;i++ ) {  
                for (let key of keys) {              
                    if (i < machine.drives.length && machine.drives[i].Properties[key]) {            
                        machine['drive.' + key + '.' + i ] = machine.drives[i].Properties[key]        
                    } else {
                        machine['drive.' + key + '.' + i ] = ''
                    }  
                }              
            }
            for (let i=0;i < numPlugins;i++ ) {  
                for (let key of pluginsKeys) {              
                    if (i < machine.plugins.length && machine.plugins[i].Properties[key]) {            
                        machine['plugin.' + key + '.' + i ] = machine.plugins[i].Properties[key]        
                    } else {
                        machine['plugin.' + key + '.' + i] = ''
                    }  
                }              
            }
        })

        //delete machines.drives, they are not needed in the pivot table
        //delete machines.plugins
        machineTable.forEach(machine => {
            delete machine.drives
            delete machine.plugins
        })

        machinePivotTable.push(Object.keys(machineTable[0]))
        machineTable.forEach(machineDetails => {
            machinePivotTable.push(Object.values(machineDetails))
        }) 

    }
    return machinePivotTable;
}
// let instrumentTable = [];

// let numModules = 0;

// Object.keys(collections).forEach(col => {
//     let collectionData = collections[col];
//     let instrumentDataByCollection =  groupBy(collectionData, "controller"); //only OLCDSINST_Instrument collection is needed
//     Object.keys(instrumentDataByCollection).forEach(controllerName => {
        
//         let controllerData = instrumentDataByCollection[controllerName];
//         let controllerDataGroupbyName = groupBy(controllerData, "name")

//         Object.keys(controllerDataGroupbyName).forEach(name => {
            
//             controllerDataGroupbyName[name].sort((r1, r2) => {
//                 if (r1.timestampatorigin === r2.timestampatorigin) return 0;
//                 return r1.timestampatorigin < r2.timestampatorigin ? 1 : -1;
//             });
//             if (col === 'OLCDSACQ_Instrument') {
//                 let instrument = controllerDataGroupbyName[name][0];
//                 if (instrument.modules.length > numModules) {
//                     numModules = instrument.modules.length
//                 }
//                 let moduleNames = instrument.modules.map(m => m.Properties.name)
//                 let moduleProps = instrument.modules[0].Properties
//                 let instrumentDetails = {controller:controllerName, name:name, driver:instrument.driver, id:instrument.id, project:instrument.project, 
//                     projectpath:instrument.projectpath, partno: moduleProps.partno, serialno:moduleProps.serialno, firmwareversion:moduleProps.firmwareversion,
//                     driverversion:'', modules:moduleNames, connectioninfo:moduleProps.connectioninfo};
//                 instrumentTable.push(instrumentDetails)
//             }
//         })
//         instrumentTable.forEach(instrumentDetails => {            
//             let modules = instrumentDetails.modules
//             for (let i=0;i < numModules;i++ ) {                
//                 if (i < modules.length) {
//                     instrumentDetails['module.' + i] = modules[i]                    
//                 } else {
//                     instrumentDetails['module.' + i] = ''
//                 }                
//             }
//         })
//     })

// })

// instrumentTable.forEach(instrumentDetails => {
//     delete instrumentDetails.modules
//     instrumentPivotTable.push(Object.values(instrumentDetails))
// })

// instrumentPivotTable.splice(0, 0, Object.keys(instrumentTable[0]))

//console.log(instrumentPivotTable[0])
//console.log(instrumentPivotTable[1])




//console.log(machinePivotTable[0]);
//console.log(machinePivotTable[1]);

function groupBy(objectArray, property) {// a list of property parameters
    return objectArray.reduce(function (acc, obj) {
        //properties.forEach(property => {
            if (obj.hasOwnProperty(property)) {
                var key = obj[property];
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
            }      
            
       // })
        return acc;
    }, {});
}

function groupByCollection(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        if (obj.hasOwnProperty(property)) {
            var key = obj[property];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj['Properties']);
        }      
        return acc;
    }, {});
}

//export const machinePivotTable;
//export const instrumentPivotTable;
