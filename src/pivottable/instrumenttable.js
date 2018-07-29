import React, { Component } from 'react';
import BaseTable from './basetable'

const columnNames=[{id:'name', label:'Instrument'}, {id :'driver', label:'Type'}, {id :'controller', label:'Controller'}]
const cellWidths = {
    head: {in:['50%', '50%', '50%'], out:['54%', '54%', '54%']},
    body: {in:['45%', '45%', '100%'], out:['40%', '45%', '100%']}
}

class InstrumentTable extends Component {

    handleRowClick = (e, name) => {
    }

    render() {
        const {zoom, data} = this.props
        if (data !== undefined) {
            return (
                <BaseTable zoom={zoom} columnNames={columnNames} handleRowClick={this.handleRowClick} data={data} 
                cellWidths={cellWidths}/>   
            )    
        } else {
            return <div></div>
        }
    }

}

export default InstrumentTable