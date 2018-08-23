import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExitToAppOutlinedIcon from '@material-ui/icons/ExitToAppOutlined';
import IconButton from '@material-ui/core/IconButton'
import DashBoardOutlinedIcon from '@material-ui/icons/DashboardOutlined'
import DevicesOutlinedIcon from '@material-ui/icons/DevicesOutlined'
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    appbar: {
        height: '50px',
        backgroundColor: '#384350',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'

    },
    icon: {
        fill: 'white',
        fontSize: '36px'
    }

})

class AppBar extends Component {

    render() {
        const { classes, handleLogout, gotoInstruments, gotoTopology } = this.props
        return (
            <div className={classes.appbar}>
                <Tooltip title="Instrument Grid Viewer">
                    <IconButton onClick={gotoInstruments} style={{ 'outline': 'none' }} >
                        <DashBoardOutlinedIcon className={classes.icon} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Topology Viewer">
                    <IconButton onClick={gotoTopology} style={{ 'outline': 'none' }} >
                        <DashBoardOutlinedIcon className={classes.icon} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Logout">
                    <IconButton onClick={handleLogout} style={{ 'outline': 'none' }}>
                        <ExitToAppOutlinedIcon className={classes.icon} />
                    </IconButton>
                </Tooltip>
            </div>
        )
    }

}

AppBar.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(AppBar);