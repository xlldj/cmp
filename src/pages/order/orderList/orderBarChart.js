import React from 'react'

import { BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import CONSTANTS from '../../../constants'
const OrderBarChart = props => {
  const { data } = props
  return (
    <div className="barChartWrapper">
      <BarChart
        width={CONSTANTS.CHARTWIDTH}
        height={CONSTANTS.CHARTHEIGHT}
        data={data}
        margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
      >
        <XAxis
          padding={{ left: 20 }}
          axisLine={{ stroke: '#ddd' }}
          name=""
          dataKey="x"
          tickLine={false}
        />
        <YAxis
          axisLine={{ stroke: '#ddd' }}
          domain={[0, dataMax => parseInt(dataMax * 1.2 + 10, 10)]}
          tickLine={false}
        />
        <Legend align="center" verticalAlign="top" wrapperStyle={{ top: 10 }} />
        <Bar
          dataKey="countUser"
          name="人数"
          isAnimationActive={true}
          legendType="rect"
          barSize={20}
          label={<CustomLabel textAnchor="end" dx={18} />}
          fill="#6bb2f2"
        />
        <Bar
          dataKey="countOrder"
          name="次数"
          barSize={20}
          label={<CustomLabel textAnchor="start" dx={0} />}
          isAnimationActive={true}
          fill="#b1dc37"
        />
      </BarChart>
    </div>
  )
}

export default OrderBarChart

class CustomLabel extends React.Component {
  render() {
    const { x, y, value, dx, textAnchor } = this.props
    console.log(this.props)
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dx={dx} dy={-10} textAnchor={textAnchor} fill="#999">
          {value > 0 ? value : ''}
        </text>
      </g>
    )
  }
}
