import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import BaseTable from './basetable'

const columnNames=[{id:'hostname', label:'Hostname'}, {id :'type', label:'Type'}]
const cellWidths = {
    head: {in:['100%', '100%'], out:['100%', '100%']},
    body: {in:['100%', '100%'], out:['100%', '100%']}
}

class ComputerTable extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.handleRowClick = this.handleRowClick.bind(this)
    }

    handleRowClick(e, name) {
        const { history: {push}} = this.props
        push('/computer-details/'+name)
    }

    render() {
        const {zoom, data } = this.props
        if (data !== undefined) {
            return (
                <BaseTable zoom={zoom} columnNames={columnNames} data={data} handleRowClick={this.handleRowClick} 
                cellWidths={cellWidths} refresh={true} />   
            )    
        } else {
            return <div></div>
        }
    }

}

export default withRouter(ComputerTable)