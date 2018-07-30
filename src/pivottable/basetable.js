import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import RefreshdOutlinedIcon from '@material-ui/icons/RefreshOutlined'
import { IconButton } from '@material-ui/core';

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
    refreshIcon: {
        width:'20px',height:'20px', outline:'none'
    },
})

class BaseTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            order:'asc', 
            orderBy:'',
            originalData:this.props.data.slice(0)
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

    handleRefresh = (event) =>  {
        this.setState({orderBy:''})
    }
    

    render() {
        const { classes, columnNames, data, handleRowClick, zoom} = this.props   
        const { order, originalData } = this.state
        let orderBy = this.state.orderBy        
        if (this.props.orderBy) {
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
                            </TableSortLabel>{index === 0? <IconButton style={{width:'20px',height:'20px', outline:'none'}}><RefreshdOutlinedIcon onClick={this.handleRefresh} /></IconButton>:''}                           
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
                        originalData
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


