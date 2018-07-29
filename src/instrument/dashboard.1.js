import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Instrument from './instrument';
import Grid from '@material-ui/core/Grid';
import EventSource from 'eventsource';


const styles = theme => ({
    root: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'row',
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

class InstrumentDashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            source : null,
            instruments : [],
                /*[
                    {deviceId:1, data: [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]},
                    {deviceId:2, data: [{value:2, name:'Pending'}, {value:1, name:'Queued'}, {value:1, name:'Done'}, {value:1, name:'Error'}]}
                ]*/
            
        }
    }

    componentDidMount() {
        let devices = [
            {deviceId:1, data: [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]},
            {deviceId:2, data: [{value:2, name:'Pending'}, {value:1, name:'Queued'}, {value:1, name:'Done'}, {value:1, name:'Error'}]}
        ]//JSON.parse(event.data)
        let instruments = {};
        for (let i=0; i < devices.length; i++) {
            let device = devices[i];
            let deviceId = device.deviceId;
            let data = device.data;
            instruments[deviceId] = data;
        }
        this.setState({...instruments});
        
        let source = new EventSource("http://localhost:3001/api/sse", eventSourceInitDict);
        source.onopen = () => { console.log(Date.now() + ':opening connection') }; 
        source.onerror = () => { console.log(Date.now() + ':an error occurred') };
        source.addEventListener('message', event => {//function(event) {  

            
              
            //if (event.id === 'CLOSE') {
            //    source.close();
            //} else {
                // this.setState(previousState => {
                //     return {instruments: JSON.parse(event.data)}
                // })  
                this.setState({instruments: JSON.parse(event.data)
                })   
            //}      
        });//.bind(this), false);
    }

    render() {
        const { classes } = this.props;
        const { instruments } = this.state;
        console.log(this.state)
        return (
            <Grid container className={classes.root} spacing={16}>                
                <Grid container justify="center" spacing={16}>
                    {instruments.map((instrument, index) => 
                    <Grid key={index} item>
                        <Instrument data={instrument} />
                    </Grid>
                    )}}
                </Grid>
            </Grid>           
        )
    }
}

InstrumentDashboard.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(InstrumentDashboard);