import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import BaseTable from './basetable'
import Network from './network'
import { COLORS } from './piechart'

const columnNames=[ {id :'property', label:'Property'}, {id :'value', label:'Value'}]
const excludedFields = ['timezoneoffsetatorigin', 'additionalinfo', 'driverversion', 'sessionid', 'timezonenameatorigin', 'manufacturer']
const instrumentTableCellWidths = {
    head: {in:['75%', '30%'], out:['75%', '30%']},
    body: {in:['30%', '70%'], out:['30%', '70%']}
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

class InstrumentDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.handleRowClick = this.handleRowClick.bind(this)
        this.handleNodeClick = this.handleNodeClick.bind(this)
        this.getArrayData = this.getArrayData.bind(this)        
        this.getGraph = this.getGraph.bind(this)
    }

    handleRowClick(e, name) {
       
    }

    handleNodeClick(name) {
        const { history:{push}} = this.props
        const { controller } = this.state
        if (controller.toUpperCase() === name.toUpperCase()) {
            push('/computer-details/'+name.toUpperCase())
        }
    }

    componentDidMount() {
        const {match} = this.props
        let instrumentName = match.params.name
        if (instrumentName === undefined) return
        let instruments = JSON.parse(sessionStorage.getItem('topology-view-completeInstruments'))
        if (instruments === null) {
            console.log('completeInstruments is null')
            return
        }
        
        let instrument = instruments.filter(inst => inst.name === instrumentName)
        if (instrument.length > 0) {
            let inst = instrument[0]
            let data = []
            Object.keys(inst).filter(key => excludedFields.indexOf(key) === -1).forEach(key => {
                let datum = {}
                if (Array.isArray(inst[key])) {
                    let arrayData = this.getArrayData(key, inst[key])
                    data.push(...arrayData)
                } else {
                    if (inst[key] !== null) {
                        datum['property']=key
                        datum['value'] = inst[key]
                        data.push(datum)
                    }
                }
            })
            const graph = this.getGraph(inst) 
            this.setState({data:data, graph:graph, controller:inst.controller})
        } 
        let title = 'Instrument: ' + instrumentName
        this.setState({title: title})        
    }

    getArrayData(key, arr) {
        let arrayData = []
        arr.forEach(o => { 
            if (o.hasOwnProperty('Properties')) {        
                let properties = o.Properties
                Object.keys(properties).filter(property => excludedFields.indexOf(property) === -1).forEach(property => {
                    let data = {}
                    data['property'] = key+'.'+property
                    data['value'] = properties[property]
                    arrayData.push(data)
                })
            }
        })
        return arrayData
    }

    getGraph(instrument) {
        let nodes = []
        let links = []
        nodes.push({id: '1', group: '1', name: instrument.name, color: COLORS[3]})
        nodes.push({id: '2', group: '1', name: instrument.controller, color: COLORS[1] })
        links.push({source: '1', target:'2', value:10})   //value - link thickness
        instrument.modules.forEach((m, index) => {
            nodes.push({id:index+3, group:'1', name:m.Properties.name, color: COLORS[0]})
            links.push({source: index+3, target:'1', value:10})
        })    
        const graph = {nodes:nodes, links:links}
        return graph
    }

    render() {
        const { classes } = this.props
        const { data, graph, title } = this.state
        if (data !== undefined) {
             return (
                <div className={classes.container}>
                    <div>{title}</div>
                    <Fragment>
                        <Network width={450} height={350} graph={graph} handleNodeClick={this.handleNodeClick}/>
                        <BaseTable zoom={'in'} columnNames={columnNames} data={data} handleRowClick={this.handleRowClick} cellWidths={instrumentTableCellWidths} refresh={true}
                    /></Fragment>
                </div>
             ) 
        } else {
            return <div></div>
        }
    }

}

InstrumentDetails.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withRouter(InstrumentDetails))