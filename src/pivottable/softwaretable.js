import React, { Component } from 'react';
import BaseTable from './basetable'

const columnNames=[{id:'applongname', label:'Name'}, {id :'appversion', label:'Version'}]
const cellWidths = {
    head: {in:['100%', '100%'], out:['100%', '100%']},
    body: {in:['100%', '100%'], out:['100%', '100%']}
}

class SoftwareTable extends Component {

    handleRowClick = (e, name) => {
    }

    render() {
        const {zoom, data} = this.props
        if (data !== undefined) {
            return (
                <BaseTable zoom={zoom} columnNames={columnNames} handleRowClick={this.handleRowClick} data={data} 
                cellWidths={cellWidths} refresh={true} />   
            )    
        } else {
            return <div></div>
        }
    }

}

export default SoftwareTable