import React, { Component, PureComponent } from 'react';
import TableRenderers from 'react-pivottable/TableRenderers';
import PivotTableUI from 'react-pivottable/PivotTableUI';
//import Papa from 'papaparse';
import './pivottable.css';
import machinedata from './machinedata'
import instrumentdata from './instrumentdata'


class PivotTableUISmartWrapper extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {pivotState: props};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({pivotState: nextProps});
    }

    render() {
        return (
            <PivotTableUI
                renderers={Object.assign(
                    {},
                    TableRenderers,
                    //createPlotlyRenderers(Plot)
                )}
                {...this.state.pivotState}
                onChange={s => this.setState({pivotState: s})}
                unusedOrientationCutoff={Infinity}
            />
        );
    }
}

class MyPivotTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            view:'machine'
        }
    }

    componentDidMount() {
    }

    componentWillMount() {
        this.setState({
            mode: 'demo',
            filename: 'Topology View',
            pivotState: {
                data: machinedata,//analytics,//
                rows: ['machinename'],//
                cols: [],
                aggregatorName: 'Count',
                vals: [],
                rendererName: 'Grouped Column Chart',
                sorters: {
                    // Meal: sortAs(['Lunch', 'Dinner']),
                    // 'Day of Week': sortAs([
                    //     'Thursday',
                    //     'Friday',
                    //     'Saturday',
                    //     'Sunday',
                    // ]),
                },
                plotlyOptions: {width: 900, height: 500},
                plotlyConfig: {},
                tableOptions: {
                    clickCallback: function(e, value, filters, pivotData) {
                        var names = [];
                        pivotData.forEachMatchingRecord(filters, function(
                            record
                        ) {
                            names.push(JSON.stringify(record));
                        });
                        alert(names.join('\n'));
                    },
                },
            },
        });
    }

    // onDrop(files) {
    //     this.setState(
    //         {
    //             mode: 'thinking',
    //             filename: '(Parsing CSV...)',
    //             textarea: '',
    //             pivotState: {data: []},
    //         },
    //         () =>
    //             Papa.parse(files[0], {
    //                 skipEmptyLines: true,
    //                 error: e => alert(e),
    //                 complete: parsed =>
    //                     this.setState({
    //                         mode: 'file',
    //                         filename: files[0].name,
    //                         pivotState: {data: parsed.data},
    //                     }),
    //             })
    //     );
    // }

    // onType(event) {
    //     Papa.parse(event.target.value, {
    //         skipEmptyLines: true,
    //         error: e => alert(e),
    //         complete: parsed =>
    //             this.setState({
    //                 mode: 'text',
    //                 filename: 'Data from <textarea>',
    //                 textarea: event.target.value,
    //                 pivotState: {data: parsed.data},
    //             }),
    //     });
    // }

    handleSelectChange = event => {        
        let view = event.target.value        
       
        if (view === this.state.view) return
        console.log(view)
        switch (view) {
            case 'machine' : {
                this.setState({
                    view: view,
                    pivotState: {
                        data: machinedata,//analytics,//
                        rows: ['machinename'],//
                        cols: [],
                        aggregatorName: 'Count',
                        vals: [],
                        rendererName: 'Grouped Column Chart',
                        sorters: {
                            // Meal: sortAs(['Lunch', 'Dinner']),
                            // 'Day of Week': sortAs([
                            //     'Thursday',
                            //     'Friday',
                            //     'Saturday',
                            //     'Sunday',
                            // ]),
                        },
                        plotlyOptions: {width: 900, height: 500},
                        plotlyConfig: {},
                        tableOptions: {
                            clickCallback: function(e, value, filters, pivotData) {
                                var names = [];
                                pivotData.forEachMatchingRecord(filters, function(
                                    record
                                ) {
                                    names.push(JSON.stringify(record));
                                });
                                alert(names.join('\n'));
                            },
                        },
                    }, 
                })
                break;
            }
            case 'instrument' : {
                this.setState({
                    view: view,
                    pivotState: {
                        data: instrumentdata,//analytics,//
                        rows: ['controller'],//
                        cols: [],
                        aggregatorName: 'Count',
                        vals: [],
                        rendererName: 'Grouped Column Chart',
                        sorters: {
                            // Meal: sortAs(['Lunch', 'Dinner']),
                            // 'Day of Week': sortAs([
                            //     'Thursday',
                            //     'Friday',
                            //     'Saturday',
                            //     'Sunday',
                            // ]),
                        },
                        plotlyOptions: {width: 900, height: 500},
                        plotlyConfig: {},
                        tableOptions: {
                            clickCallback: function(e, value, filters, pivotData) {
                                var names = [];
                                pivotData.forEachMatchingRecord(filters, function(
                                    record
                                ) {
                                    names.push(JSON.stringify(record));
                                });
                                alert(names.join('\n'));
                            },
                        },
                    }, 
                })
                break;
            }
            default: 
        }
    }

    render() {
        return (
            <div>
                <div className="row">
                    <h2 className="text-center">{this.state.filename}</h2>
                    <label htmlFor="view"></label>
                    <select name="view" onChange={this.handleSelectChange}>
                        <option value="machine">Machine View</option>
                        <option value="instrument">Instrument View</option>
                    </select>
                    <br />
                    <br />
                    <PivotTableUISmartWrapper {...this.state.pivotState} />
                </div>
            </div>
        );
    }
}

export default MyPivotTable;