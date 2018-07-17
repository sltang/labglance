import React, { Component} from 'react';
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
            //instruments : [],
                /*[
                    {deviceId:1, data: [{value:3, name:'Pending'}, {value:0, name:'Queued'}, {value:0, name:'Done'}, {value:1, name:'Error'}]},
                    {deviceId:2, data: [{value:2, name:'Pending'}, {value:1, name:'Queued'}, {value:1, name:'Done'}, {value:1, name:'Error'}]}
                ]*/
            
        }
    }

    componentDidMount() {
       
        
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
                //let data = device.data;
                instruments[deviceId] = device.data;
            }
            this.setState({...instruments});

            
              
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

    render() {
        const { classes } = this.props;
        //const { instruments } = this.state;
        //console.log(this.state)
        if (Object.keys(this.state).length > 0) {
            return (
                <Grid container className={classes.root} spacing={16}>                
                    <Grid container justify="center" spacing={16}>
                        {Object.keys(this.state).map((key, index) => {
                            //console.log(key);
                            //console.log(this.state[key]);
                            return <Grid key={index} item>
                            <Instrument deviceId={key} data={this.state[key]} />
                            </Grid>
                        })}
                        
                    </Grid>
                </Grid>           
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