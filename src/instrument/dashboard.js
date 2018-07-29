import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Instrument from './instrument';
import Grid from '@material-ui/core/Grid';
import EventSource from 'eventsource';
import InfiniteScroll from "react-infinite-scroll-component";
import './dashboard.css'
import axios from 'axios';


const styles = theme => ({
    root: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'row',
      minHeight: '380px'
    },
    paper: {
        height: 360,
        width: 240,
    },
})

const eventSourceInitDict = {
    headers: {
        'Last-Event-ID':1
    },
}

const statesToFilter = ['groupBy', 'filterBy', 'groupedInstruments']

class InstrumentDashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            //instruments : [],
                /*[
                    {deviceId:1, data: [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]},
                    {deviceId:2, data: [{value:2, name:'Pending'}, {value:1, name:'Queued'}, {value:1, name:'Done'}, {value:1, name:'Error'}]}
                ]*/
            groupBy : '',//put this in a wrapper 
            filterBy : '',//put this in a wrapper
            groupedInstruments : {}//put this in a wrapper
        }
    }

    componentDidMount() {     
        let instruments = sessionStorage.getItem('instruments')
        
        if (instruments === null) {
            let token = sessionStorage.getItem('token') 
            if (token !== null)
            axios.get('http://csteevesserver2:6625/olss/v1.0/instruments', {headers:{'Authorization':'Bearer '+token}} )
                .then(function (response) {
                    // handle success
                    console.log(response);
                    //let instruments = response.data
                    //probably need to transform data
                    //sessionStorage.setItem('instruments', JSON.stringigy(instruments))
                    //this.setState({...instruments});
                })
                .catch(function (error) {
                    // handle error
                    console.log(error);                    
                })
                .then((() => {
                    // always executed
                    //dev only
                    let devices = [
                        {deviceId:1, data: [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]},
                        {deviceId:2, data: [{value:2, name:'Pending'}, {value:1, name:'Queued'}, {value:1, name:'Done'}, {value:0, name:'Error'}]}
                    ]//response.data
                    //probably need to transform data
                    let dInstruments = {};
                    for (let i=0; i < devices.length; i++) {
                        let device = devices[i];
                        let deviceId = device.deviceId;
                        dInstruments[deviceId] = device.data;
                    }
                    sessionStorage.setItem('instruments', JSON.stringify({...dInstruments}))
                    this.setState({...dInstruments});
                })(this));
        
        } else {
            let dInstruments = JSON.parse(instruments);
            this.setState(dInstruments);
        }
        
        let source = new EventSource("http://localhost:3001/api/sse", eventSourceInitDict);
        source.onopen = () => { console.log(Date.now() + ':opening connection') }; 
        source.onerror = () => { console.log(Date.now() + ':an error occurred') };
        source.addEventListener('message', event => {//function(event) {  
            
            let devices = JSON.parse(event.data)
            if (devices.length === 0) return;
            let instruments = {};
            for (let i=0; i < devices.length; i++) {
                let device = devices[i];
                let deviceId = device.deviceId;
                instruments[deviceId] = device.data;
            }
            this.setState({...instruments});

            if (this.state.groupBy) {
                let filtered = []
                Object.keys(this.state).filter(key => statesToFilter.indexOf(key) === -1).forEach(key => {
                    let o = {};
                    o[key] = this.state[key]
                    filtered.push(o)
                })
                
                let groupedInstruments = filtered.reduce((acc, instru) => {
                    let status = this.getStatus(Object.values(instru)[0]);
                    if (!acc[status]) {
                        acc[status] = [];
                    }
                    acc[status].push(instru);
                    return acc;
                }, {});
                this.setState({groupedInstruments:groupedInstruments})

            }

            
              
            //if (event.id === 'CLOSE') {
            //    source.close();
            //} else {
                // this.setState(previousState => {
                //     return {instruments: JSON.parse(event.data)}
                // })  
                //this.setState({instruments: JSON.parse(event.data)})   
            //}      
        });//.bind(this), false);
    }

    groupByStatus = (instruments) => {
        return instruments.reduce((acc, instru) => {
            let status = this.getStatus(Object.values(instru)[0]);
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(instru);
            return acc;
        }, {});
    }

    groupBy(objectArray, property) {
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

    handleGroupBy = event => {
        let groupBy = event.target.value;
        let filtered = []
        Object.keys(this.state).filter(key => statesToFilter.indexOf(key) === -1).forEach(key => {
            let o = {};
            o[key] = this.state[key]
            filtered.push(o)
        })
        
        let groupedInstruments = this.groupByStatus(filtered)
        // filtered.reduce((acc, instru) => {
        //     let status = this.getStatus(Object.values(instru)[0]);
        //     if (!acc[status]) {
        //         acc[status] = [];
        //     }
        //     acc[status].push(instru);
        //     return acc;
        // }, {});
        this.setState({groupedInstruments:groupedInstruments, groupBy: groupBy})
    }

    handleFilterBy = event => {
        let filterBy = event.target.value
        let filtered = []
        Object.keys(this.state).filter(key => statesToFilter.indexOf(key) === -1).forEach(key => {
            let o = {};
            o[key] = this.state[key]
            filtered.push(o)
        })
        let groupedInstruments = this.groupByStatus(filtered)
        console.log(filtered)
        console.log(groupedInstruments)
        Object.keys(groupedInstruments).forEach(key =>{
            if (key !== filterBy) {
                delete groupedInstruments[key]
            }
        })
        console.log(groupedInstruments)
        this.setState({groupedInstruments:groupedInstruments, filterBy:filterBy})
    }

    handleClose = (e, id) => {
        //console.log(id)        
        if (this.state.groupBy === '' && this.state.filterBy === '') {
            let state = this.state
            delete state[id]
            this.setState(state)
        } else {    
            let groupedInstruments = this.state.groupedInstruments
            console.log(Object.values(groupedInstruments))
            Object.values(groupedInstruments).forEach(arr => {
                let idx = -1;
                arr.forEach((o, index) => {
                    if (o.hasOwnProperty(id)) {
                        idx = index
                        console.log(idx)
                        return                        
                    }
                })
                if (idx !== -1) {
                    arr.splice(idx, 1)
                }
            })
            this.setState({groupedInstruments:groupedInstruments})
        }
        //console.log(this.state)
    }

    getStatus = (data) => {
        //console.log(data)
        let values = data.map(s => s.value)
        if (values[3] > 0) return 'Error';
        if (values[0] > 0 || values[1] > 0) return 'Running';
        if (values[0] === 0 && values[1] === 0 && values[2] > 0 && values[3] === 0) return 'Idle';
        if (values[0] === 0 && values[1] === 0 && values[2] === 0 && values[3] === 0)  return 'Not Connected';
    }

    fetchMoreData = () => {
        if (Object.keys(this.state).length >= 300) {
          this.setState({ hasMore: false });
          return;
        }

        setTimeout(() => {
            let moreInstruments = {}
            let start = Object.keys(this.state).length-statesToFilter.length
            for (let i=0; i< 10;i++) {
                moreInstruments[start+i] = [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]
            }
            this.setState({
              ...this.state, ...moreInstruments
            });
            //groupedInstruments too
          }, 500);

    }

    render() {
        const { classes } = this.props;
        const { groupedInstruments, groupBy, filterBy } = this.state;
        console.log(this.state)
        if (Object.keys(this.state).length > 0) {
            return (
                <React.Fragment>
                    <div style={{'marginBottom':'20px'}}>
                    <label htmlFor="groupBy">Group by:</label>
                    <select name="groupBy" onChange={this.handleGroupBy}>
                        <option value="">Select</option>
                        <option value="status">Status</option>
                    </select>

                    <label htmlFor="filterBy">Filter by:</label>
                    <select name="filterBy" onChange={this.handleFilterBy}>
                        <option value="">Select</option>
                        <option value="Error">Status - Error</option>
                        <option value="Running">Status - Running</option>
                        <option value="Not Connected">Status - Not Connected</option>
                        <option value="LC/MS">Instrument Type - LC/MS</option>
                    </select>
                    </div>
                    <InfiniteScroll
                    dataLength={Object.keys(this.state).length}
                    next={this.fetchMoreData}
                    hasMore={true}
                    scrollThreshold={0.99}
                    loader={''}
                    style={{'overflow': 'hidden'}}
                    endMessage={'No more instruments'}
                    >
                    {(groupBy === '' && filterBy === '') ?
                   
                    <Grid container className={classes.root} spacing={16}>                
                        <Grid container justify="center" spacing={16}>
                            {Object.keys(this.state).filter(state => statesToFilter.indexOf(state) === -1).map((key, index) => {
                                return <Grid key={index} item>
                                <Instrument deviceId={key} data={this.state[key]} handleClose={this.handleClose}/>
                                </Grid>
                            })}                        
                        </Grid>
                    </Grid> 
                    : 
                    Object.keys(groupedInstruments).map((key, index) => {
                        return <React.Fragment>
                                {groupedInstruments[key].length > 0 ? <div>{key}</div> : ''}
                                <br />
                                <Grid container className={classes.root} spacing={16}> 
                                    <Grid container justify="center" spacing={16}>
                                    {Object.keys(groupedInstruments[key]).map((k, index) => {
                                    return <Grid key={index} item>
                                    <Instrument key={k} deviceId={Object.keys(groupedInstruments[key][k])[0]} data={Object.values(groupedInstruments[key][k])[0]} handleClose={this.handleClose} />
                                    </Grid>
                                    })}
                                    </Grid>
                                </Grid>
                                <br />
                                </React.Fragment>
                        })
                    }
                    </InfiniteScroll>
                </React.Fragment>         
            )
        } else {
            return <div></div>
        }
    }
}

InstrumentDashboard.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(InstrumentDashboard);