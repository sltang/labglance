import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import './login.css';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

const styles = theme => ({
    login: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        display: '-webkit-flex',
        '-webkit-align-items': 'flex-start',
        alignItems: 'flex-start',
        fontFamily: 'Noto Sans',
        color: '#fff',
        marginTop: '12%',
        fontWeight: 500,
        flexDirection: 'column',
        marginLeft: '33.33%',
        marginRight: '33.33%',
        justifyContent: 'center',
        '-webkit-justify-content': 'center',
        width: '33.33%',
    },
    welcome: {
        fontSize: '1.75rem',
        lineHeight: '1.5em'
    },
    brand: {
        fontFamily: 'Agilent TT Cond',
        alignItems: 'start',
        justifyContent: 'left',
        textAlign: 'left',
        lineHeight: '1.5em',
        fontSize: '1.75rem',
    },
    brandBold: {
        fontFamily: 'Agilent TT Cond Bold',
    },
    module: {
        fontWeight: 500,
        lineHeight: '2.0em',
        marginTop: '15px',
    },
    panelBody: {
        marginTop: '10px',
    },
    enterCredentials: {
        fontStyle: 'italic',
        fontSize: '0.8rem',
        marginTop: '15px',
        marginBottom: '10px',
    },
    label: {
        fontSize: '.75rem',
        fontWeight: 700
    },
    input: {
        lineHeight: 1.5,

    },
    username: {
        border: '1px solid rgba(255,255,255,.12)',
        borderTopColor: 'rgba(255, 255, 255, 0.12)',
        backgroundColor: '#fff',
        color: '#000',
        width: '100%',
    },
    submit: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '100%',
    },
    submitButton: {
        width: '30%',
        marginTop: '15px',
        border: '1px solid rgba(255,255,255,.12)',
        lineHeight: 1.5,
        fontSize: '.875rem',
    },
    errorMessage: {
        fontSize: '0.8rem',
        color: '#ff0000'
    },
    footer: {
        color: '#000',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        height: '45px',
        position: 'absolute',
        bottom: '0px',
        width: '100%',
        alignItems: 'center',
    },
    brandName: {
        fontSize: '0.9rem',
        fontFamily: 'Agilent TT Cond',
    }
});

class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            domain: '',
            errorMessage: ''

        }
    }

    componentDidMount() {
        document.body.style.background = '#007bff';
    }

    componentWillUnmount() {
        document.body.style.background = '#ffffff';
    }

    handleUsername = event => {
        let username = event.target.value
        this.setState({ username: username })
    }

    handlePassword = event => {
        let password = event.target.value
        this.setState({ password: password })
    }

    handleDomain = event => {
        let domain = event.target.value

        this.setState({ domain: domain })
    }

    handleSubmit = event => {
        const { handleLogin } = this.props
        const { username, password, domain } = this.state;

        axios.post('http://csteevesserver2:6625/olss/v1.0/login', {
            username: username,
            password: password
        })
            .then(((response) => {
                //console.log(response.status);
                //sessionStorage.setItem('token', response.data)
                sessionStorage.setItem('token', '1234')
                handleLogin(true)
                //this.props.history.push('/main')
                //push to dashboard
            })(this))
            .catch(((error) => {
                //console.log(error);
                this.setState({ errorMessage: 'Login failed. Please try again.' })
            })(this));

    }


    handleMouseOver = event => {
        this.setState({ hovered: true });
    }

    handleMouseOut = () => {
        this.setState({ hovered: false });
    }

    style = () => {
        if (this.state.hovered) {
            return { backgroundColor: "#e2e6ea", cursor: 'pointer' }
        } else {
            return { backgroundColor: "#fff" }
        }
    }


    render() {
        const { classes, productName, moduleName, showOpenLabBrandName, showDomainInput } = this.props;
        const { username, password, domain, errorMessage } = this.state;

        return (
            <div>
                <div className={classes.login}>
                    <div className={classes.welcome}>Welcome to:</div>
                    <div className={classes.brand}>
                        {showOpenLabBrandName ? <span><span className={classNames(classes.brand, classes.brandBold)}>Open</span>Lab</span> : ''}
                        {productName ? productName : 'Control Panel'}</div>
                    <div className={classes.module}>{moduleName ? moduleName : 'Administration module'}</div>
                    <div className={classes.panelBody}>
                        <div className={classes.enterCredentials}>Please login with your account.</div>
                    </div>
                    <label htmlFor="username" className={classes.label}>USERNAME</label>
                    <input name="username" placeholder="Please enter your username." className={classNames(classes.username, classes.input)}
                        type="text" value={username} onChange={this.handleUsername} />
                    <label htmlFor="password" className={classes.label}>PASSWORD</label>
                    <input placeholder="Please enter your password." className={classNames(classes.username, classes.input)}
                        type="password" value={password} onChange={this.handlePassword} />
                    {showDomainInput ?
                        <div><label htmlFor="domain" className={classes.label}>DOMAIN</label>
                            <input placeholder="Please enter your domain." className={classNames(classes.username, classes.input)}
                                type="text" value={domain} onChange={this.handleDomain} /></div>
                        : ''}
                    {errorMessage ? <div className={classes.errorMessage}>{errorMessage}</div> : ''}
                    <div className={classes.submit}>
                        <button className={classes.submitButton} style={this.style()} onMouseOver={this.handleMouseOver} onMouseOut={this.handleMouseOut} onClick={this.handleSubmit}>Login</button>
                    </div>

                </div>
                <div className={classes.footer}>
                    <span className="ol-logo-agilent-spark"></span>
                    <div className={classes.brandName}>Agilent Technologies</div>
                </div>
            </div>

        )
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
}
export default withStyles(styles, { withTheme: true })(withRouter(Login));