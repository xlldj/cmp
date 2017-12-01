import React from 'react'

import UserChart from './charts/userChart'
import OrderChart from './charts/orderChart'
import BonusChart from './charts/bonusChart'
import FundChart from './charts/fundChart'
import RepairChart from './charts/repairChart'
import RepairTimeChart from './charts/repairTimeChart'

export default class ChartsWrapper extends React.Component {
  render () {
    let {selectedSchool, startTime, endTime, timeUnit, compare, timeSpan} = this.props
    return (
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
    )
  }
}
