import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import injectSheet from 'react-jss'

const styles = theme => ({
    overview: {
        fontWeight: 'bold',
        fontSize: '12px',
        marginTop: '10px',
        marginLeft: '10px',
        width: '100%',

    },
    overviewHead :{
        display: 'flex',
        alignItems : 'center',
    },
    workloadContainer : {
        display: 'flex',
        flexDirection : 'row',
        alignItems : 'center',
    },
    workload : {
        display: 'flex',
        flexDirection : 'column',
        alignItems : 'center',
        paddingRight: '5px'
    }
})

class Workload extends Component {

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const { classes, deviceId, data, handleClose } = this.props;
        //const { workload } = this.state;//do not use state
        //console.log(deviceId)
        return (
            <div className={classes.overview}>
                <div style={{'backgroundColor':'#A9A9A9', 'display':'flex', 'justifyContent':'space-between'}}>
                    <div>Agilent 7800</div>
                    <div onClick={e => {handleClose(e, deviceId)}}>x</div>
                </div>
                <div className={classes.overviewHead}>Analysis Workload Overview</div>
                <div className={classes.workloadContainer}>
                {data.map((wl, index) => {
                    return <div key={index} className={classes.workload}><div>{wl.value}</div><div>{wl.name}</div></div>
                })}
                </div>
            </div>
        )
    }
}

Workload.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Workload);