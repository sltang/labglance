
import React, { PureComponent} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { PieChart, Pie, Cell } from 'recharts';
//const data = [{name: 'Group A', value: 400}, {name: 'Group B', value: 300}, {name: 'Group C', value: 300}, {name: 'Group D', value: 200}];
const COLORS = ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'];
const GREY_COLORS = ['#565656', '#565656', '#565656', '#565656', '#565656'];

//const RADIAN = Math.PI / 180; 

const styles = theme => ({
    container: {
        position:'relative', width:'172px', height:'80px'
    },
    label: {
        position:'absolute', top:'65%', left:'42%', fontSize:'10px',
    },
    total: {
        display: 'flex',
        flexDirection: 'column',
        position:'absolute', top:'65%', left:'42%', fontSize:'10px',
    }
})


class Gauge extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
        }
    }

    onPieEnter= event => {

    }

    isNoData = (data) => {
        return data.filter(d => d.value > 0).length === 0
    }



    render() {
        const { classes, data } = this.props; 
        let isNoData = this.isNoData(data)
        let colors = isNoData ? GREY_COLORS : COLORS
        let mydata = []        
        if (isNoData) {
            this.props.data.forEach(s => mydata.push(s))
            mydata.push({value:100, name:'not connected'})
        } else {
            mydata = this.props.data
        }
        return (
            <div className={classes.container}>
                <PieChart width={170} height={80} onMouseEnter={this.onPieEnter}>
                    <Pie
                        data={mydata} 
                        dataKey="value" 
                        cx={80} 
                        cy={80} 
                        startAngle={180}
                        endAngle={0}
                        innerRadius={40}
                        outerRadius={80} 
                        fill="#565656"
                        paddingAngle={1}
                    >
                        {
                        data.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]}/>)
                        }
                    </Pie>
                
                </PieChart>
            <div className={classes.total}>
                <div>{data[0].value}</div>
                <div>Total</div>
            </div>
          </div>
        );
      
    }
}

Gauge.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Gauge);