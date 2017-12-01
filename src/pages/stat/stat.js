import React, { Component } from 'react'

import Time from '../component/time'
import OverView from './overView'
import Charts from './charts'
import RankPanel from './rankPanel'

const NOW = Date.parse(new Date())

const DAY = {
  1:'本日',
  2:'本周',
  3:'本月'
}
const LASTDAY = {
  1:'昨日',
  2:'上周',
  3:'上月'
}

/*----------timeUnit:1-hour,2-day------------*/
/*----------target:1-订单数量，2-订单收益--------*/
/*----------timespan: 1-今日，2-本周,3-本月-----*/

export default class Stat extends Component {
  state={
    selectedSchool:'all',
    startTime: Time.getWeekStart(NOW),
    endTime: Time.getWeekEnd(NOW),
    timeUnit: 2,
    compare: false
  }
  componentDidMount () {
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  changeSchool=(v)=>{
    this.setState({
      selectedSchool: v
    })
  }
  changeTime = (startTime, endTime) => {
    this.setState({
      startTime: startTime,
      endTime: endTime
    })
  }
  changeTimeUnit = (u) => {
    this.setState({
      timeUnit: u
    })
  }
  changeCompare = (checked) => {
    this.setState({
      compare: checked
    })
  }
  changeTimeSpan = (v) => {
    this.setState({
      timeSpan: v
    })
  }
  render () {
    let {selectedSchool, startTime, endTime, compare, timeUnit, timeSpan} = this.state
    return (
        <div className='statContent'>
          <OverView hide={this.props.hide} />
          <Charts 
            selectedSchool={selectedSchool}
            startTime={startTime}
            endTime={endTime}
            timeUnit={timeUnit}
            compare={compare}
            timeSpan={timeSpan}
          />

          <RankPanel />
        </div>
    )
  }
}
