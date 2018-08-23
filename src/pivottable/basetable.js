import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import IconButton from '@material-ui/core/IconButton'
import RefreshdOutlinedIcon from '@material-ui/icons/RefreshOutlined'

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    container: {
    },
    tableHead: {
        backgroundColor: '#d3d3d3',
        display: 'block',
    },
    tableBody: {
        display: 'block',
        overflowY: 'auto',
    },
    tableRow: {
        height: '35px'
    },
    refreshIcon: {
        width: '20px', height: '20px', outline: 'none'
    },
})

class BaseTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            order: 'asc',
            orderBy: ''
        };
        this.handleRefresh = this.handleRefresh.bind(this)
        this.handleRequestSort = this.handleRequestSort.bind(this)
        this.setHeadCellWidth = this.setHeadCellWidth.bind(this)
        this.setBodyCellWidth = this.setBodyCellWidth.bind(this)
        this.getSorting = this.getSorting.bind(this)
    }

    componentDidMount() {
        this.setState({ originalData: this.props.data.slice(0) })
    }

    handleRequestSort(event, property) {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy });
    };

    getSorting(order, orderBy) {
        return order === 'desc'
            ? (a, b) => {
                if (b[orderBy] < a[orderBy]) return -1
                if (b[orderBy] > a[orderBy]) return 1
                return 0
            }
            : (a, b) => {
                if (b[orderBy] < a[orderBy]) return 1
                if (b[orderBy] > a[orderBy]) return -1
                return 0
            }
    }

    setHeadCellWidth(index) {
        const { zoom, cellWidths } = this.props
        if (cellWidths !== undefined && zoom !== undefined) {
            return { width: cellWidths.head[zoom][index] }
        } 
        return { width:'100%'}
    }

    setBodyCellWidth(index) {
        const { zoom, cellWidths } = this.props
        if (cellWidths !== undefined && zoom !== undefined) {
            return { width: cellWidths.body[zoom][index] }
        } 
        return { width:'100%'}
    }

    handleRefresh(event) {
        this.setState({ orderBy: '' })
    }

    render() {
        const { classes, columnNames, data, handleRowClick, zoom, refresh } = this.props
        const keys = columnNames.map(col => col.id)
        const { order, originalData } = this.state
        let orderBy = this.state.orderBy
        if (this.props.orderBy) {
            orderBy = this.props.orderBy
        }
        if (originalData !== undefined) {
            return (
                <div className={classes.container}>
                    <Table>
                        <TableHead className={classes.tableHead}>
                            <TableRow className={classes.tableRow}>
                                {columnNames.map((column, index) => {
                                    return <TableCell key={index}
                                        style={this.setHeadCellWidth(index)}
                                        sortDirection={orderBy === column.id ? order : false}
                                    >
                                        <TableSortLabel
                                            onClick={e => this.handleRequestSort(e, column.id)}
                                        >
                                            {column.label}
                                        </TableSortLabel> {index === 0 && refresh ? <IconButton style={{width: '22px', height: '22px', outline: 'none'}}><RefreshdOutlinedIcon onClick={this.handleRefresh} /></IconButton>:''}
                                    </TableCell>
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody className={classes.tableBody} style={zoom === 'in' ? { 'height': '100%' } : { 'height': '220px' }}>
                            {(orderBy || data.length !== originalData.length) ? data
                                .sort(this.getSorting(order, orderBy))
                                .map((row, index) => {
                                    return <TableRow key={index} hover={true} className={classes.tableRow} onClick={e => handleRowClick(e, Object.values(row)[0])}>
                                        {Object.keys(row).filter(k => keys.indexOf(k) >= 0).map((k, index) => {
                                            return <TableCell key={index} style={this.setBodyCellWidth(index)}>{row[k]}</TableCell>
                                        })}
                                    </TableRow>
                                }) :
                                originalData
                                    .map((row, index) => {
                                        return <TableRow key={index} hover={true} className={classes.tableRow} onClick={e => handleRowClick(e, Object.values(row)[0])}>
                                            {Object.keys(row).filter(k => keys.indexOf(k) >= 0).map((k, index) => {
                                                return <TableCell key={index} style={this.setBodyCellWidth(index)}>{row[k]}</TableCell>
                                            })}
                                        </TableRow>
                                    })}
                        </TableBody>
                    </Table>
                </div>)
        } else {
            return <div></div>
        }
    }

}

BaseTable.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(BaseTable)


