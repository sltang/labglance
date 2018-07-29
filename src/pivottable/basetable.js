import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    container: {
    },
    tableHead: {
        backgroundColor : '#d3d3d3',
        display: 'block',
    },
    tableBody: {
        display:'block',
        overflowY: 'auto',     
    },
    tableRow: {
        height:'35px'
    },
    tableHeadCell:{
        width:'100%'
    },
    tableBodyCell:{
        width:'100%'
    },
    tableCell:{
        width:'100%'
    },
})

class BaseTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            order:'asc', 
            orderBy:''
        };
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy });
    };

    getSorting = (order, orderBy) => {
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

    setHeadCellWidth = (index) => {
        const { zoom, cellWidths } = this.props
        return {width:cellWidths.head[zoom][index]}
    }

    setBodyCellWidth = (index) => {
        const { zoom, cellWidths } = this.props
        return {width:cellWidths.body[zoom][index]}
    }
    

    render() {
        const { classes, columnNames, data, handleRowClick, zoom} = this.props   
        const { order } = this.state
        let orderBy = '' 
        if (this.state.orderBy) {
            orderBy = this.state.orderBy
        } else if (this.props.orderBy) {
            orderBy = this.props.orderBy
        }
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
                            </TableSortLabel>                            
                            </TableCell>
                        })}
                    </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody} style={zoom === 'in'? {'height':'100%'}:{'height':'200px'}}>
                    {orderBy ? data
                    .sort(this.getSorting(order, orderBy))
                    .map((row, index) => {
                        return <TableRow key={index} hover={true} className={classes.tableRow} onClick={e => handleRowClick(e, Object.values(row)[0])}>
                                {Object.keys(row).map((k, index) => {
                                    return <TableCell key={index} style={this.setBodyCellWidth(index)}>{row[k]}</TableCell>                                     
                                })}                                     
                        </TableRow>}):
                        data
                        .map((row, index) => {
                            return <TableRow key={index} hover={true} className={classes.tableRow} onClick={e => handleRowClick(e, Object.values(row)[0])}>
                                    {Object.keys(row).map((k, index) => {
                                        return <TableCell key={index} style={this.setBodyCellWidth(index)}>{row[k]}</TableCell>                                     
                                    })}                                     
                            </TableRow>

                    })}
                </TableBody>
            </Table>
            </div>
        )
    }

}

BaseTable.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(BaseTable)


