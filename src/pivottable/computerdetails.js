import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import BaseTable from './basetable'
import Network from './network'
import { COLORS } from './piechart'

const columnNames=[ {id :'property', label:'Property'}, {id :'value', label:'Value'}]
const excludedFields = ['timezoneoffsetatorigin', 'action', 'timestampatorigin', 'sessionid', 'username', 'timezonenameatorigin', 'uptime', 'appname', 'installationtype', 'id']
const instrumentTableCellWidths = {
    head: {in:['70%', '30%'], out:['75%', '30%']},
    body: {in:['55%', '100%'], out:['55%', '100%']}
}
const computerTableCellWidths = {
    head: {in:['75%', '25%'], out:['75%', '30%']},
    body: {in:['30%', '70%'], out:['30%', '70%']}
}
const serverTableCellWidths = {
    head: {in:['75%', '30%'], out:['75%', '30%']},
    body: {in:['20%', '80%'], out:['30%', '70%']}
}
const styles = theme => ({
    root: {
      flexGrow: 1,
    },
    container: {
        width: '50%',
        marginTop : '10px',
        marginLeft : '10px'
    },
})

class ComputerDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.handleRowClick = this.handleRowClick.bind(this)
        this.handleNodeClick = this.handleNodeClick.bind(this)
        this.getArrayData = this.getArrayData.bind(this)
        this.getInstruments = this.getInstruments.bind(this)
        this.getServer = this.getServer.bind(this)
    }

    handleRowClick(e, name) {
       
    }

    componentDidMount() {
        const {match} = this.props
        if (sessionStorage.getItem('topology-view-computers') === null) return
        let machinename = match.params.name
        if (machinename === undefined) return
        const computers = JSON.parse(sessionStorage.getItem('topology-view-computers'))
        let title = ''
        let computer = computers.filter(comp => comp.machinename === machinename)
        if (computer.length > 0) {
            let comp = computer[0]
            let data = []
            Object.keys(comp).filter(key => excludedFields.indexOf(key) === -1).forEach(key => {
                let datum = {}
                if (Array.isArray(comp[key])) {
                    let arrayData = this.getArrayData(key, comp[key])
                    data.push(...arrayData)
                } else {
                    datum['property']=key
                    datum['value'] = comp[key]
                    data.push(datum)
                }
            })
            //instruments
            const {instruments, graph} = this.getInstruments(machinename) 
            this.setState({data:data, instruments:instruments, graph:graph})
            if (instruments.length > 0) {
                title += 'Controller: '
            } else {
                title += 'Computer: '
            }
        } 
        //servers  
        const server = this.getServer(machinename)
        if (server.length > 0) {
            this.setState({server:server})
            title += 'Server: '
        } 
        title += machinename
        this.setState({title: title, machinename:machinename})        
    }

    getArrayData(key, arr) {
        let arrayData = []
        arr.forEach(o => { 
            if (o.hasOwnProperty('Properties')) {        
                let properties = o.Properties
                Object.keys(properties).forEach(property => {
                    let data = {}
                    data['property'] = key+'.'+property
                    data['value'] = properties[property]
                    arrayData.push(data)
                })
            }
        })
        return arrayData
    }

    getInstruments(controllerName) {
        //is computer a controller?
        const instruments = sessionStorage.getItem('topology-view-instruments') === null? []: JSON.parse(sessionStorage.getItem('topology-view-instruments'))
        let instrus = []
        let nodes = []
        let links = []
        instruments.filter(instrument => instrument.controller === controllerName).forEach((instrument, index) => {
            let driver = {property : 'driver', value : instrument.driver}
            let name = {property: 'name', value: instrument.name}
            instrus.push(driver)
            instrus.push(name)
            nodes.push({id: index+2, group: '1', name: instrument.name, color: COLORS[3]})
            links.push({source: '1', target:index+2, value:10})
        })
        if (nodes.length > 0) {
            nodes.push({id: '1', group: '1', name: controllerName, color: COLORS[1]})
        }
        const graph = {nodes:nodes, links:links}
        return {instruments:instrus, graph:graph}
    }

    getServer(name) {
        const ss = sessionStorage.getItem('topology-view-servers') === null? []: JSON.parse(sessionStorage.getItem('topology-view-servers'))
        let server = []
        ss.filter(svr => svr.olsshostname === name).forEach(svr => {            
            Object.keys(svr).filter(key => excludedFields.indexOf(key) === -1).forEach(key => {
                if (typeof svr[key] === 'object') {
                    Object.keys(svr[key]).filter(k => excludedFields.indexOf(k) === -1).forEach(k => {
                        server.push({'property' : k, 'value': svr[key][k]})
                    })
                } else {
                    server.push({'property' : key, 'value': svr[key]})
                }
            })
        })        
        return server
    }

    handleNodeClick(name) {
        const { history:{push}} = this.props
        const { machinename } = this.state
        if (machinename !== name) {
            push('/instrument-details/'+name)
        }
    }

    render() {
        const {classes } = this.props
        const { data, instruments, server, graph, title } = this.state
        if (data !== undefined) {
             return (
                <div className={classes.container}>
                    <div>{title}</div>
                    {instruments && instruments.length > 0 ?
                    <Fragment>
                        <Network width={450} height={350} graph={graph} handleNodeClick={this.handleNodeClick}/>
                        <BaseTable zoom={'in'} columnNames={columnNames} data={instruments} handleRowClick={this.handleRowClick} cellWidths={instrumentTableCellWidths} refresh={true}
                    /><br /></Fragment> :
                    ''}
                    {data.length > 0 ?
                    <Fragment><BaseTable zoom={'in'} columnNames={columnNames} data={data} handleRowClick={this.handleRowClick} cellWidths={computerTableCellWidths} refresh={true}
                    /><br /></Fragment>
                    :
                    ''}
                </div>
             ) 
        } else if (server !== undefined)  {
            return  <div className={classes.container}>
            <div>{title}</div>
            <BaseTable zoom={'in'} columnNames={columnNames} data={server} handleRowClick={this.handleRowClick} cellWidths={serverTableCellWidths} refresh={true}/>
            </div>
        } else {
            return <div></div>
        }
    }

}

ComputerDetails.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withRouter(ComputerDetails))