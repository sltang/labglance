import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Route, withRouter, Switch } from 'react-router-dom';
import AppBar from './appbar'
import InstrumentDashboard from '../instrument/dashboard';
import GridLayout from '../pivottable/gridblock'
import ComputerDetails from '../pivottable/computerdetails'

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

    gotoDevices = () => {
        const { history: {push} } = this.props;
        push('/dashboard')
    }

    render() { 
        const { classes, handleLogout } = this.props
        return (
            <div className={classes.root}>
                <AppBar handleLogout={handleLogout} gotoTopology={this.gotoTopology} gotoDevices={this.gotoDevices}/>
                <Switch>               
                    <Route exact path="/dashboard" component={InstrumentDashboard} />
                    <Route exact path="/topology-view" component={GridLayout} />
                    <Route exact path="/computer-details/:name" component={ComputerDetails} />
                </Switch>
            </div>
        )
    }

}

MainLayout.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withRouter(MainLayout));