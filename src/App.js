import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { Route, Link } from "react-router-dom";
import InstrumentDashboard from './instrument/dashboard';
import MyPivotTable from './pivottable/pivottable'

class App extends Component {
  render() {
    return (
      <div className="App">
        <ul>
          <li>
            <Link to="/pivot-table">Pivot Table</Link>
          </li>
        </ul>

        <Route exact path="/dashboard" component={InstrumentDashboard} />
        <Route exact path="/pivot-table" component={MyPivotTable} />
      </div>
    );
  }
}

export default App;
