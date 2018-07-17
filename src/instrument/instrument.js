import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Workload from './workload';
import Gauge from './gauge';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const styles = theme =>  ({
    instrumentCard : {
        width:'192px', 
        height:'200px',
        display: 'flex',
        flexDirection : 'column',
    },
    card: {
        maxWidth: 220,
    },

})


class Instrument extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data : this.props.data,
        }
    }

    componentDidUpdate(nextProps) {
        //console.log(nextProps);
    }

    render() {
        const { classes, data } = this.props;
        //const { data } = this.state;//do not use state
        //console.log(data);
        return (
            <Card className={classes.card}>
                <CardContent>
                    <Workload data={data}/>
                    <Gauge data={data} />
                </CardContent>
            </Card>
        )
    }
}

Instrument.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Instrument);