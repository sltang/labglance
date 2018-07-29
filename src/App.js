import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { withRouter } from "react-router-dom";
//import MyPivotTable from './pivottable/pivottable' 
import Login from './login/login'
import MainLayout from './layout/main'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
     loggedIn : false
    }
  }

  componentDidMount() {
    if (sessionStorage.getItem('token') === null) {
      this.props.history.push('/login')
    }
  }

  handleLogin = (loggedIn) => {
    this.setState({loggedIn})
    this.props.history.push('/')
  }
  
  handleLogout = () => {
    sessionStorage.clear()
    this.setState({loggedIn: false}) 
    this.props.history.push('/login')
  }
  
  render() {
    return (
      <div>
        {sessionStorage.getItem('token') !== null ?
          <MainLayout handleLogout={this.handleLogout} />
          :
          <Login productName="Lab At A Glance" handleLogin={this.handleLogin} />       
        }
      </div>
    );
  }
}

export default withRouter(App);

      // <div className="App">
      //   <ul>
      //     <li>
      //       <Link to="/dashboard">Dashboard</Link>
      //     </li>
      //     <li>
      //       <Link to="/pivot-table">Pivot Table</Link>
      //     </li>
      //     <li>
      //       <Link to="/login">Login</Link>
      //     </li>
      //   </ul>

        
      //   <Route exact path="/pivot-table" component={MyPivotTable} />
      //   <Route exact path="/login" component={Login} />
      /*div>
      <Route exact path="/dashboard" render={(props) => ( <InstrumentDashboard handleLogout={this.handleLogout} /> )} />
      </div>*/
