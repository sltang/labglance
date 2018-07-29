import React, { Component, Fragment } from 'react'

class Login extends Component {

    constructor(props){
        super(props)
        this.state = {username:'', password:''}
    }

    handleNvEnter = (event) => {
        console.log(event)
        this.setState({ username: event.detail.username, password: event.detail.password })
    }

    componentDidMount() {
        this.nv.addEventListener("login", this.handleNvEnter);
      }
    
      componentWillUnmount() {
        this.nv.removeEventListener("login", this.handleNvEnter);
      }
    render() {
        return (
        <Fragment>
            <ng-login ref={el => this.nv = el} username={this.state.username} password={this.state.password}></ng-login>
            <div>
            User Name: {this.state.username}
          </div>
          <div>
            password: {this.state.password}
          </div>

        </Fragment>
        )
    }
}

export default Login