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

let machineTable = []
let machinePivotTable = []

/*
parse analytics.json
*/
export const parseData = (raw) => {
    try { 
        let data = JSON.parse(raw);
        return groupByCollection(data, "CollectionName")
    } catch (e) {
        console.log(e)
    }
}

export const getServers = (collections) => {
    if (collections === undefined) {
        console.log("collections is undefined")
        return []
    }
    let olsshostnames = groupBy(collections['OLCDSINST_Topology'], "olsshostname")
    let servers = []

    Object.keys(olsshostnames).forEach(olsshostname => {
        let server = olsshostnames[olsshostname];        
        server.sort((r1, r2) => {
            if (r1.timestampatorigin === r2.timestampatorigin) return 0;
            return r1.timestampatorigin < r2.timestampatorigin ? -1 : 1;
        });
        servers.push(server[0])
    })
    return servers;
}

export const getControllers = (collections) => {
    if (collections === undefined) {
        console.log("collections is undefined")
        return {}
    }
    let crtls = {}
    let controllers = groupBy(collections['OLCDSINST_Instrument'], "controller")
    
    Object.keys(controllers).forEach(controller => {
        let instruments = groupBy(controllers[controller], "name")
        Object.keys(instruments).forEach( name => {
            let instrument = instruments[name].sort((r1, r2) => {
                if (r1.timestampatorigin === r2.timestampatorigin) return 0;
                return r1.timestampatorigin < r2.timestampatorigin ? -1 : 1;
            })[0];
            if (crtls[controller] === undefined) {
                crtls[controller] = [];
            } 
            crtls[controller].push(instrument)    
        })
    })
    return crtls
}

export const getComputers = (collections) => {
    if (collections === undefined) {
        console.log("collections is undefined")
        return []
    }
    let computers = []
    let machines = groupBy(collections['OLCDSACQ_Session'], "machinename");
    Object.keys(machines).forEach(machineName => {
        let machine = machines[machineName];
        machine.sort((r1, r2) => {
            if (r1.sessionstarttime === r2.sessionstarttime) return 0;
            return r1.sessionstarttime < r2.sessionstarttime ? 1 : -1;
        });
        computers.push(machine[0])
    })
    let instprocs = groupBy(collections['OLCDSINST_Session'], "machinename");//OpenLAB CDS Instrument Process
    Object.keys(instprocs).filter(machineName => Object.keys(machines).indexOf(machineName) === -1).forEach(machineName => {
        let machine = instprocs[machineName];
        machine.sort((r1, r2) => {
            if (r1.sessionstarttime === r2.sessionstarttime) return 0;
            return r1.sessionstarttime < r2.sessionstarttime ? 1 : -1;
        });
        computers.push(machine[0])
    })
    return computers
}

export const getDataAnalysisSoftware = (collections, computers) => {
    let das = groupBy(collections['OLCDSDA_Session'], "appversion")
    let da = []
    Object.keys(das).forEach(appversion => {
        let version = das[appversion]
        version.sort((r1, r2) => {
            if (r1.sessionstarttime === r2.sessionstarttime) return 0;
            return r1.sessionstarttime < r2.sessionstarttime ? 1 : -1;
        });
        da.push({
            machinename:version[0].machinename,
            applongname:'Agilent OpenLAB CDS Data Analysis', 
            appversion:version[0].appversion,
            installationdirectory:version[0].installationdirectory,
            sessionstarttime: version[0].sessionstarttime
        })
        computers.forEach(comp => {
            if (comp => comp.machinename === version[0].machinename) {
                comp['applongname1'] = 'Agilent OpenLAB CDS Data Analysis'
                comp['appversion1'] = version[0].appversion
            } 
        })
    })
    return da
}

export const getInstruments = (collections) => {    
    let instruments = groupBy(collections['OLCDSACQ_Instrument'], 'name')// OLCDSINST_Instrument is missing module information
    let insts = [] //only for instrument table
    let completeInstruments = [] //complete instrument details
    Object.keys(instruments).forEach(name => {
        let instrument = instruments[name].sort((r1, r2) => {
            if (r1.timestampatorigin === r2.timestampatorigin) return 0;
            return r1.timestampatorigin < r2.timestampatorigin ? 1 : -1;
        })[0];
        insts.push({
            name: instrument.name,
            driver: instrument.driver,
            controller: instrument.controller.toUpperCase(),
        })
        completeInstruments.push(instrument)
    })
    return {instruments:insts, completeInstruments:completeInstruments};
}

export const searchPC = (computers, keywords) => {
    let pcs = []   
    let lckeywords = keywords.toLowerCase()
    computers.forEach(computer => {
        let match = false
        Object.keys(computer).forEach(key => {
            const value = computer[key]
            if (value === null || match) return            
            if (key === 'drives') {
                value.forEach(drv => {
                    Object.values(drv.Properties).forEach(v => {
                        if (!v || match) return
                        if ((v.includes && v.toLowerCase().includes(lckeywords)) || (typeof v === 'number' && v.toString() === keywords)) {
                            pcs.push(computer)
                            match = true                      
                        }
                    })
                })
            } else if (key === 'plugins') {
                value.forEach(plugin => {
                    Object.values(plugin.Properties).forEach(v => {
                        if (!v || match) return
                        if ((v.includes && v.toLowerCase().includes(lckeywords)) || (typeof v === 'number' && v.toString() === keywords)) {
                            pcs.push(computer)
                            match = true
                        }
                    })
                })
            } else if ((value.includes && value.toLowerCase().includes(lckeywords)) || (typeof value === 'number' && value.toString() === keywords)) {
                pcs.push(computer)
                match = true
            }        
        })        
    })
    return pcs
}

export const searchSoftware = (software, keywords) => {
    let lckeywords = keywords.toLowerCase()
    return Object.keys(software).filter(s => {
        let match = false
        Object.values(s).forEach(v => {
            if ((v.includes && v.toLowerCase().includes(lckeywords)) || (typeof v === 'number' && v.toString() === keywords)) {
                match = true
            }
        })
        return match
    })
}

export const searchInstruments = (collections, keywords) => {
    let lckeywords = keywords.toLowerCase()
    let instruments = groupBy(collections['OLCDSACQ_Instrument'], "name")
    let insts= []
    Object.keys(instruments).forEach( name => {
        let instrument = instruments[name].sort((r1, r2) => {
            if (r1.timestampatorigin === r2.timestampatorigin) return 0;
            return r1.timestampatorigin < r2.timestampatorigin ? -1 : 1;
        })[0];
        let match = false
        Object.keys(instrument).forEach(key => {
            const value = instrument[key]            
            if (value === null || match) return
            if (key === 'modules') {
                value.forEach(mod => {
                    Object.values(mod.Properties).forEach(v => {
                        if (!v || match) return
                        if ((v.includes && v.toLowerCase().includes(lckeywords)) || (typeof v === 'number' && v.toString() === keywords)) {
                            match = true
                            insts.push(instrument)                            
                        }
                    })
                })
            } else if ((value.includes && value.toLowerCase().includes(lckeywords)) || (typeof value === 'number' && value.toString() === keywords)) {
                match = true
                insts.push(instrument)
            }  
        })
    })
    return insts
}

export const getMachinePivotTable = (collections) => {
    if (machinePivotTable.length === 0) {
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

/*
group array elements by property
*/
function groupBy(objectArray, property) {
    if (objectArray === undefined) {
        console.error('objectArray is undefined')
        return {}
    }
    return objectArray.reduce(function (acc, obj) {
        if (obj.hasOwnProperty(property)) {
            var key = obj[property];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
        }      
        return acc;
    }, {});
}

function groupByCollection(objectArray, property) {
    if (objectArray === undefined) {
        console.error('objectArray is undefined')
        return {}
    }
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

