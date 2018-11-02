import React, { Component, Fragment } from 'react';
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
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Subject } from 'rxjs/Subject';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

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
    refreshIcon: {
        width: '24px', height: '24px', outline: 'none'
    },
})

const zoomInCss = {
}

const zoomOutCss = {
    display: 'none'
}

const restoreCss = {
    display: 'inline'
}

class TopologyViewer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            zoom: 'out', selected: '',
            counts: sessionStorage.getItem('topology-view-counts') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-counts')),
            computerTable: sessionStorage.getItem('topology-view-computerTable') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-computerTable')),
            software: sessionStorage.getItem('topology-view-software') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-software')),
            instruments: sessionStorage.getItem('topology-view-instruments') === null ? [] : JSON.parse(sessionStorage.getItem('topology-view-instruments')),
            keywords: ''
        };
        this.handleSearch$ = new Subject();
        this.handleUpload = this.handleUpload.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.search = this.search.bind(this)
        this.handleResetSearch = this.handleResetSearch.bind(this)
        this.handleZoom = this.handleZoom.bind(this)
    }

    componentDidMount() {
        this.handleSearch$
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                map((term) => this.search(term))
            )
            .subscribe(matches => {
                const { pcs, insts } = matches
                const computerNames = pcs.map(pc => pc.machinename)
                const computerTable = JSON.parse(sessionStorage.getItem('topology-view-computerTable'))
                const searchResults = computerTable.filter(c => computerNames.indexOf(c.hostname) >= 0)
                const instruments = JSON.parse(sessionStorage.getItem('topology-view-instruments'))
                const instrumentNames = insts.map(i => i.name)
                const instrumentResults = instruments.filter(i => instrumentNames.indexOf(i.name) >= 0)
                this.setState({ computerTable: searchResults, instruments: instrumentResults })
            })
    }

    handleZoom(event, id) {
        const { zoom } = this.state
        if (zoom === 'out') {
            this.setState({ zoom: 'in', selected: id })
        } else {
            this.setState({ zoom: 'out' })
        }
    }

    handleUpload() {
        let reader = new FileReader();
        reader.readAsText(this.uploadInput.files[0]);
        reader.onload = () => {
            let data = '[' + reader.result.split('\r\n').filter(line  => line !== '').join(',') + ']'
            let collections = dataService.parseData(data)
            if (collections === undefined) {
                this.setState({counts:[], error:'An exception occurred while parsing data'})
                return
            }
            let servers = dataService.getServers(collections)

            let controllers = dataService.getControllers(collections)

            let computers = dataService.getComputers(collections)

            let numServers = servers.length
            let numControllers = Object.keys(controllers).length
            let numComputers = computers.length - numControllers


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
                    apps.push({
                        'machinename': comp.machinename, 'applongname': comp.applongname, 'appversion': comp.appversion,
                        'sessionstarttime': comp.sessionstarttime, 'installationdirectory': comp.installationdirectory
                    })
                }
            })
            let das = dataService.getDataAnalysisSoftware(collections, computers)
            let software = [...apps, ...das]

            //instrument table
            const { instruments, completeInstruments } = dataService.getInstruments(collections)

            let counts = [{ name: 'Server', value: numServers }, { name: 'Controller', value: numControllers }, { name: 'Client', value: numComputers }, { name: 'Instrument', value: instruments.length }]

            this.setState({ counts: counts, computerTable: computerTable, software: software, instruments: instruments, error:'' })
            sessionStorage.setItem('topology-view-servers', JSON.stringify(servers))
            sessionStorage.setItem('topology-view-computers', JSON.stringify(computers))
            sessionStorage.setItem('topology-view-counts', JSON.stringify(counts))
            sessionStorage.setItem('topology-view-computerTable', JSON.stringify(computerTable))
            sessionStorage.setItem('topology-view-software', JSON.stringify(software))
            sessionStorage.setItem('topology-view-instruments', JSON.stringify(instruments))
            //sessionStorage.setItem('topology-view-collections', JSON.stringify(collections))
            sessionStorage.setItem('topology-view-completeInstruments', JSON.stringify(completeInstruments))

        }
    }

    handleSearch(event) {
        const term = event.target.value
        if (term) {
            this.handleSearch$.next(term)
        } else {
            const computerTable = JSON.parse(sessionStorage.getItem('topology-view-computerTable'))
            const instruments = JSON.parse(sessionStorage.getItem('topology-view-instruments'))
            this.setState({ computerTable, instruments })
        }
        this.setState({ keywords: term })
    }

    search(term) {
        const computers = JSON.parse(sessionStorage.getItem('topology-view-computers'))
        const pcs = dataService.searchPC(computers, term)
        const collections = JSON.parse(sessionStorage.getItem('topology-view-collections'))
        const instruments = dataService.searchInstruments(collections, term)
        return { pcs: pcs, insts: instruments }
    }

    handleResetSearch(event) {
        if (this.state.keywords !== '') {
            const computerTable = JSON.parse(sessionStorage.getItem('topology-view-computerTable'))
            const instruments = JSON.parse(sessionStorage.getItem('topology-view-instruments'))
            this.setState({ keywords: '', computerTable, instruments })
        }
    }

    render() {
        const { classes, handleComputerTableClick, handleInstrumentTableClick } = this.props
        const { zoom, selected, counts, computerTable, software, instruments, keywords, error } = this.state
        let zoomIn = zoom === 'in'
        return (
            <div className={classes.root}>
                <div className="row" style={{ 'width': '100%' }}>
                    <div className={classNames('col-12', 'col-md-6')} style={zoomIn ? zoomOutCss : restoreCss}>
                        <div className={classes.paper} style={{ flexDirection: 'row' }}>
                            <label htmlFor="upload">Select JSON:</label>
                            <input type="file" ref={el => this.uploadInput = el} onChange={this.handleUpload}/>  
                            <span style={{color:'red'}}>{error}</span>        
                        </div>                        
                    </div>
                    <div className={classNames('col-12', 'col-md-6')} style={zoomIn ? zoomOutCss : restoreCss}>
                        {counts.length > 0 ?
                            <div style={{ textAlign: 'right' }}><TextField value={keywords} onChange={this.handleSearch} InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            /><IconButton style={{ 'outline': 'none' }}><ClearIcon onClick={this.handleResetSearch} /></IconButton></div> : ''
                        }
                    </div>
                </div>
                {counts.length > 0 ? <Fragment>
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
                                    <div><IconButton onClick={e => this.handleZoom(e, 'Software')} style={{ 'outline': 'none' }}>
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
                                <ComputerTable zoom={zoom} data={computerTable} handleComputerTableClick={handleComputerTableClick}/>
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
                                <InstrumentTable zoom={zoom} data={instruments} handleInstrumentTableClick={handleInstrumentTableClick}/>
                            </div>
                        </div>
                </div></Fragment> : <div></div>}

            </div>)



    }
}

TopologyViewer.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(TopologyViewer)