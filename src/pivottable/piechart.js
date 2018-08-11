import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { PieChart, Pie, Cell } from 'recharts';

const styles = theme =>  ({
    container: {
        display: 'flex',        
    }
})

export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;                    

class TopologyPieChart extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const {data} = this.props
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN) - 16;

        return (
            <text x={x} y={y} fill="white" dominantBaseline="central">
                <tspan x={x} dy="1.0em">{data[index].name}</tspan>
                <tspan x={x} dx="1.2em" dy="1.0em">{data[index].value}</tspan>
            </text>
        );
   }

    render() {
        const {classes, data} = this.props
        if (data !== undefined) {
            return (
                <div className={classes.container}>
                    <PieChart width={300} height={200} style={{width: '100%', fontSize:'12px'}}>                
                        <Pie
                        data={data} 
                        cx={'50%'} 
                        cy={'50%'}
                        dataKey="value" 
                        labelLine={false}
                        label={this.renderCustomizedLabel}
                        outerRadius={100} 
                        fill="#8884d8"
                        >
                        {
                            data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
                        }
                        </Pie>
                    </PieChart>
                </div>
            );
        } else {
            return  <div></div>
        }
    }
}

TopologyPieChart.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(TopologyPieChart);