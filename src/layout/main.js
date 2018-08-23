import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Route, withRouter, Switch } from 'react-router-dom';
import AppBar from './appbar'
import InstrumentDashboard from '../instrument/dashboard';
import TopologyViewer from '../pivottable/topologyviewer'
import ComputerDetails from '../pivottable/computerdetails'
import InstrumentDetails from '../pivottable/instrumentdetails'

const styles = theme => ({

    root: {
        display: "flex",
        flexDirection: 'column',
    },
})

class MainLayout extends Component {

    gotoTopology = () => {
        const { history: {push} } = this.props;
        push('/topology-view')
    }

    gotoInstruments = () => {
        const { history: {push} } = this.props;
        push('/dashboard')
    }

    render() { 
        const { classes, handleLogout } = this.props
        return (
            <div className={classes.root}>
                <AppBar handleLogout={handleLogout} gotoTopology={this.gotoTopology} gotoInstruments={this.gotoInstruments}/>
                <Switch>               
                    <Route exact path="/dashboard" component={InstrumentDashboard} />
                    <Route exact path="/topology-view" component={TopologyViewer} />
                    <Route exact path="/computer-details/:name" component={ComputerDetails} />
                    <Route exact path="/instrument-details/:name" component={InstrumentDetails} />
                </Switch>
            </div>
        )
    }

}

MainLayout.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withRouter(MainLayout));