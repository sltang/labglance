import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ZoomOutMapOutlinedIcon from '@material-ui/icons/ZoomOutMap'
import ZoomOutOutlinedIcon from '@material-ui/icons/ZoomOut'
import IconButton from '@material-ui/core/IconButton'
import TopologyPieChart from './piechart'
import ComputerTable from './computertable'
import SoftwareTable from './softwaretable'
import InstrumentTable from './instrumenttable'
import classNames from 'classnames';
import * as dataService from './data-processor'

const styles = theme => ({
    root: {
        flexGrow: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '12px'
    },
    paper: {
        padding: '12px',
        textAlign: 'center',
        color: theme.palette.text.secondary,
        display: 'flex',
        flexDirection: 'column',     
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
})

const zoomInCss = {
    top: '50px',
    position: 'absolute',
}

const zoomOutCss = {
    display: 'none'
}

const restoreCss = {
    display: 'inline'
}

class GridLayout extends Component {

    constructor(props) {
        super(props);
        this.state = {
            zoom: 'out', selected: '',
            counts: sessionStorage.getItem('topology-view-counts') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-counts')),
            computerTable: sessionStorage.getItem('topology-view-computerTable') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-computerTable')),
            software: sessionStorage.getItem('topology-view-software') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-software')),
            instruments: sessionStorage.getItem('topology-view-instruments') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-instruments'))
        };
    }

    componentDidMount() {

    }

    handleZoom = (event, id) => {
        const { zoom } = this.state
        if (zoom === 'out') {
            this.setState({ zoom: 'in', selected: id })
        } else {
            this.setState({ zoom: 'out' })
        }
    }

    handleUpload = event => {
        event.preventDefault();
        let reader = new FileReader();
        reader.readAsText(this.uploadInput.files[0]);
        reader.onload = () => {
            let collections = dataService.parseData(reader.result)
            let servers = dataService.getServers(collections)
            
            let controllers = dataService.getControllers(collections)
            
            let computers = dataService.getComputers(collections)
            
            let numServers = servers.length
            let numControllers = Object.keys(controllers).length
            let numComputers = computers.length - numControllers
            let counts = [{ name: 'Server', value: numServers }, { name: 'Controller', value: numControllers }, { name: 'Client', value: numComputers }]

            //computers table
            let controllerNames = Object.keys(controllers).map(controllerName => controllerName.toUpperCase())
            let computerNames = computers.map(comp => comp['machinename'].toUpperCase()).filter(machinename => controllerNames.indexOf(machinename) === -1).map(machinename => { return { 'hostname': machinename, 'type': 'Client' } })
            let controllerTable = controllerNames.map(controllerName => { return { 'hostname': controllerName, 'type': 'Controller' } })
            let serverNames = servers.map(server => { return { 'hostname': server.olsshostname, 'type': 'Server' } })
            let computerTable = [...computerNames, ...controllerTable, ...serverNames]

            //software table
            let versions = []
            let apps = []
            computers.forEach(comp => {
                if (comp.hasOwnProperty('appversion') && versions.indexOf(comp.appversion) === -1 && comp.appversion) {
                    versions.push(comp.appversion)
                    apps.push({ 'applongname': comp.applongname, 'appversion': comp.appversion })
                }
            })
            let das = dataService.getDataAcquistionSoftware(collections)
            let software = [...apps, ...das]

            //instrument table
            let instruments = dataService.getInstruments(controllers)
            this.setState({ counts: counts, computerTable: computerTable, software: software, instruments: instruments })
            sessionStorage.setItem('topology-view-servers', JSON.stringify(servers))
            sessionStorage.setItem('topology-view-computers', JSON.stringify(computers))
            sessionStorage.setItem('topology-view-counts', JSON.stringify(counts))
            sessionStorage.setItem('topology-view-computerTable', JSON.stringify(computerTable))
            sessionStorage.setItem('topology-view-software', JSON.stringify(software))
            sessionStorage.setItem('topology-view-instruments', JSON.stringify(instruments))

        }
    }

    render() {
        const { classes } = this.props
        const { zoom, selected, counts, computerTable, software, instruments } = this.state
        let zoomIn = zoom === 'in'
        return (
            <div className={classes.root}>
                <div className="row" style={{ 'width': '100%' }}>
                    <div className={classNames('col-12', 'col-md-6')} style={zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper} style={{ textAlign: 'left' }}>
                            <form onSubmit={this.handleUpload}>
                                <label htmlFor="upload">Select JSON:</label>
                                <input type="file" ref={el => this.uploadInput = el} />
                                <input className="btn btn-outline-primary btn-sm" value="Upload" type="submit" />
                            </form>
                        </div>
                    </div>
                </div>
                <div className="row" style={{ 'width': '100%' }}>
                    <div className={classNames('col-12', 'col-md-6')} style={zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper}>
                            <div className={classes.header}>
                                <div>Overview</div>
                            </div>
                            <TopologyPieChart data={counts} />
                        </div>
                    </div>
                    <div className={classNames('col-12', zoomIn && selected === 'Software' ? 'col-md-12' : 'col-md-6')} style={zoomIn && selected === 'Software' ? zoomInCss : zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper} >
                            <div className={classes.header}>
                                <div>Software</div>
                                <div><IconButton onClick={e => this.handleZoom(e, 'Software')}>
                                    {zoomIn ? <ZoomOutOutlinedIcon />
                                        : <ZoomOutMapOutlinedIcon />}
                                </IconButton>
                                </div>
                            </div>
                            <SoftwareTable zoom={zoom} data={software} />
                        </div>
                    </div>
                </div>
                <div className="row" style={{ 'width': '100%' }}>
                    <div className={classNames('col-12', zoomIn && selected === 'Computers' ? 'col-md-12' : 'col-md-6')} style={zoomIn && selected === 'Computers' ? zoomInCss : zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper} >
                            <div className={classes.header}>
                                <div>Computers</div>
                                <div><IconButton onClick={e => this.handleZoom(e, 'Computers')} style={{ 'outline': 'none' }}>
                                    {zoomIn ? <ZoomOutOutlinedIcon />
                                        : <ZoomOutMapOutlinedIcon />}
                                </IconButton>
                                </div>
                            </div>
                            <ComputerTable zoom={zoom} data={computerTable} />
                        </div>
                    </div>
                    <div className={classNames('col-12', zoomIn && selected === 'Instruments' ? 'col-md-12' : 'col-md-6')} style={zoomIn && selected === 'Instruments' ? zoomInCss : zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper} >
                            <div className={classes.header}>
                                <div>Instruments</div>
                                <div><IconButton onClick={e => this.handleZoom(e, 'Instruments')} style={{ 'outline': 'none' }}>
                                    {zoomIn ? <ZoomOutOutlinedIcon />
                                        : <ZoomOutMapOutlinedIcon />}
                                </IconButton>
                                </div>
                            </div>
                            <InstrumentTable zoom={zoom} data={instruments} />
                        </div>
                    </div>
                </div>

            </div>
        )

    }
}

GridLayout.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(GridLayout)