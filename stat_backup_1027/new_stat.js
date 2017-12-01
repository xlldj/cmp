import React, { Component } from 'react'

import Time from '../component/time'
import SelectBar from './selectBar'

import {asyncComponent} from '../component/asyncComponent'

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

const OverView = asyncComponent(()=>import(/* webpackChunkName: "overView" */ "./overView"))
const OrderChart = asyncComponent(()=>import(/* webpackChunkName: "orderChart" */ "./charts/orderChart"))
const UserChart = asyncComponent(()=>import(/* webpackChunkName: "UserChart" */ "./charts/userChart"))
const BonusChart = asyncComponent(()=>import(/* webpackChunkName: "bonusChart" */ "./charts/bonusChart"))
const FundChart = asyncComponent(()=>import(/* webpackChunkName: "fundChart" */ "./charts/fundChart"))
const RepairChart = asyncComponent(()=>import(/* webpackChunkName: "repairChart" */ "./charts/repairChart"))
const RepairTimeChart = asyncComponent(()=>import(/* webpackChunkName: "repairTimeChart" */ "./charts/repairTimeChart"))

const OrderRank = asyncComponent(()=>import(/* webpackChunkName: "orderRank" */ "./ranks/orderRank"))
const UserRank = asyncComponent(()=>import(/* webpackChunkName: "userRank" */ "./ranks/userRank"))
const BonusRank = asyncComponent(()=>import(/* webpackChunkName: "bonusRank" */ "./ranks/bonusRank"))
const FundsRank = asyncComponent(()=>import(/* webpackChunkName: "fundsRank" */ "./ranks/fundsRank"))
const RepairRank = asyncComponent(()=>import(/* webpackChunkName: "repairRank" */ "./ranks/repairRank"))


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
    console.log(checked)
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
      <div className='stat'>
        <SelectBar 
          changeSchool={this.changeSchool}
          changeTimeUnit={this.changeTimeUnit}
          changeTime={this.changeTime}
          changeCompare={this.changeCompare}
          changeTimeSpan={this.changeTimeSpan}
        />
        <div className='statContent'>
          <OverView />
          <div className='content'>
            <div className='chartPanel'>
              <OrderChart 
                selectedSchool={selectedSchool}
                startTime={startTime}
                endTime={endTime}
                timeUnit={timeUnit}
                compare={compare}
                timeSpan={timeSpan}
              />
              <UserChart />
              <BonusChart />
              <FundChart />
              <RepairChart />
              <RepairTimeChart />
            </div>
            <div className='ranks' >
              <OrderRank 
                startTime={startTime}
                endTime={endTime}
              />
              <UserRank />
              <BonusRank />
              <FundsRank />
              <RepairRank />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
