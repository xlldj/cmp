import React from 'react'
import { Route } from 'react-router-dom'
import Bread from '../bread'
import './style/style.css'

import {asyncComponent} from '../component/asyncComponent'

const OrderDetail = asyncComponent(()=>import(/* webpackChunkName: "OrderDetail" */ "./rankDetail/orderDetail"))
const UserDetail = asyncComponent(()=>import(/* webpackChunkName: "UserDetail" */ "./rankDetail/userDetail"))
const RepairDetail = asyncComponent(()=>import(/* webpackChunkName: "repairDetial" */ "./rankDetail/repairDetail"))
const FundsDetail = asyncComponent(()=>import(/* webpackChunkName: "fundsDetail" */ "./rankDetail/fundsDetail"))
const BonusDetail = asyncComponent(()=>import(/* webpackChunkName: "bonusDetail" */ "./rankDetail/bonusDetail"))
const Stat = asyncComponent(()=>import(/* webpackChunkName: "stat" */ "./stat"))

const breadcrumbNameMap = {
  '/orderRank': '订单排行榜',
  '/userRank': '用户排行榜',
  '/bonusRank': '红包排行榜',
  '/fundsRank': '资金排行榜',
  '/repairRank': '报修排行榜'
}

class StatDisp extends React.Component {
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap} single={true} parent='stat' parentName='统计分析' />
        </div>

        <div >
          <Route exact path='/stat' render={(props) => (<Stat hide={this.props.hide} {...props} />)} />
          <Route path='/stat/orderRank' render={(props) => (<OrderDetail hide={this.props.hide} {...props} />)} />
          <Route path='/stat/userRank' render={(props) => (<UserDetail hide={this.props.hide} {...props} />)} />
          <Route path='/stat/fundsRank' render={(props) => (<FundsDetail hide={this.props.hide} {...props} />)} />
          <Route path='/stat/bonusRank' render={(props) => (<BonusDetail hide={this.props.hide} {...props} />)} />
          <Route path='/stat/repairRank' render={(props) => (<RepairDetail hide={this.props.hide} {...props} />)} />
        </div>
      </div>
    )
  }
}

export default StatDisp

