import React from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'

import {asyncComponent} from '../component/asyncComponent'

import Bread from '../bread'
import './style/style.css'
import {getLocal, setLocal} from '../util/storage'
import AjaxHandler from '../ajax'
import Time from '../component/time'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../actions'

const ChargeContainer = asyncComponent(()=>import(/* webpackChunkName: "chargeContainer" */ "./charge/chargeContainer"))
const FundContainer = asyncComponent(()=>import(/* webpackChunkName: "fundContainer" */ "./fundList/fundContainer"))
const DepositContainer = asyncComponent(()=>import(/* webpackChunkName: "chargeList" */ "./deposit/depositContainer"))
const CashtimeContainer = asyncComponent(()=>import(/* webpackChunkName: "cashtime" */ "./cashtime/cashtimeContainer"))
const AbnormalContainer = asyncComponent(()=>import(/* webpackChunkName: "abnormalFund" */ "./abnormal/abnormal"))

const breadcrumbNameMap = {
  '/list': '资金列表',
  '/list/fundInfo': '资金详情',
  '/charge': '充值面额',
  '/charge/addCharge': '添加充值面额',
  '/charge/editCharge': '编辑充值面额',
  '/cashtime': '提现时间设置',
  '/cashtime/addCashtime': '添加提现时间',
  '/cashtime/editCashtime': '编辑提现时间',
  '/deposit': '充值活动',
  '/deposit/depositInfo': '编辑充值活动',
  '/deposit/addDeposit': '创建充值活动',
  '/abnormal': '异常资金'
}

class FundDisp extends React.Component {
  setStatusForfund = () => {
    this.clearStatus4fundIIlist()
  }
  clearStatus4fundIIlist = () => {
    this.getDefaultSchool()
    this.props.changeFund('fundList', {page: 1, type: 'all', status: 'all', selectKey: '', startTime: Time.get7DaysAgo(), endTime: Time.getNow()})
  }
  clearStatus4fundIIcashtime = () => {
    this.props.changeFund('cashtime', {page: 1})
  }
  clearStatus4fundIIcharge = () => {
    this.props.changeFund('charge', {page: 1})
  }
  clearStatus4fundIIdeposit = () => {
    this.props.changeFund('deposit', {page: 1, schoolId: 'all'})
  }
  clearStatus4fundIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeFund('abnormal', {page: 1, selectKey: ''})
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (getLocal('defaultSchool')) {
      let defaultSchool = getLocal('defaultSchool')
      selectedSchool = defaultSchool
    } else {
      this.setDefaultSchool()
    }
    if (selectedSchool !== 'all') {
      this.props.changeFund('fundList', {schoolId: selectedSchool})
      this.props.changeFund('abnormal', {schoolId: selectedSchool})
    }
  }
  setDefaultSchool = () => {
    let resource = '/school/list'
    const body = {
      page: 1,
      size: 1
    }
    const cb = (json) => {
      if (json.data.schools) {
        let selectedSchool = json.data.schools[0].id.toString()
        setLocal('defaultSchool', selectedSchool)
        this.props.changeFund('fundList', {schoolId: selectedSchool})
      } 
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  render () {
    return (
      <div>
        <div className='breadc'>
          <Bread breadcrumbNameMap={breadcrumbNameMap}
            parent='fund'
            setStatusForfund={this.setStatusForfund}
            clearStatus4fundIIlist={this.clearStatus4fundIIlist}
            clearStatus4fundIIcashtime={this.clearStatus4fundIIcashtime}  
            clearStatus4fundIIcharge={this.clearStatus4fundIIcharge} 
            clearStatus4fundIIdeposit={this.clearStatus4fundIIdeposit}
            clearStatus4fundIIabnormal={this.clearStatus4fundIIabnormal}
            parentName='资金管理' 
          />
        </div>

        <div className='disp'>
          <Switch>
            <Route path='/fund/deposit' render={(props) => (<DepositContainer hide={this.props.hide} {...props} />)} />
            <Route path='/fund/charge' render={(props) => (<ChargeContainer hide={this.props.hide} {...props} />)} />
            <Route path='/fund/cashtime' render={(props) => (<CashtimeContainer hide={this.props.hide} {...props} />)} />
            <Route path='/fund/list' render={(props) => (<FundContainer hide={this.props.hide} {...props} />)} />
            <Route path='/fund/abnormal' render={(props) => (<AbnormalContainer hide={this.props.hide} {...props} />)} />
            <Route exact path='/fund' render={(props) => (<Redirect to='/fund/list' />)} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default withRouter(connect(null, {
  changeFund
})(FundDisp))