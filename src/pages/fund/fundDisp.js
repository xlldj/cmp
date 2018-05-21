import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import { asyncComponent } from '../component/asyncComponent'

import Bread from '../component/bread'
import './style/style.css'
import { getLocal } from '../../util/storage'
import Time from '../../util/time'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../actions'

const ChargeContainer = asyncComponent(() =>
  import(/* webpackChunkName: "chargeContainer" */ './charge/chargeContainer')
)
const RechargeContainer = asyncComponent(() =>
  import(/* webpackChunkName: "rechargeContainer" */ './rechargeList/container')
)
const WithdrawContainer = asyncComponent(() =>
  import(/* webpackChunkName: "withdrawContainer" */ './withdrawList/container')
)
const DepositContainer = asyncComponent(() =>
  import(/* webpackChunkName: "chargeList" */ './deposit/depositContainer')
)
const CashtimeContainer = asyncComponent(() =>
  import(/* webpackChunkName: "cashtime" */ './cashtime/cashtimeContainer')
)
const AbnormalContainer = asyncComponent(() =>
  import(/* webpackChunkName: "abnormalFund" */ './abnormal/abnormal')
)
const FreeGiving = asyncComponent(() =>
  import(/* webpackChunkName: "freeGiving" */ './freeGiving/container.js')
)

const breadcrumbNameMap = {
  '/list': '充值列表',
  '/list/info': '充值详情',
  '/withdrawList': '提现列表',
  '/withdrawList/info': '提现详情',
  '/charge': '充值面额',
  '/charge/addCharge': '添加充值面额',
  '/charge/editCharge': '编辑充值面额',
  '/cashtime': '提现时间设置',
  '/cashtime/addCashtime': '添加提现时间',
  '/cashtime/editCashtime': '编辑提现时间',
  '/deposit': '充值活动',
  '/deposit/depositInfo': '编辑充值活动',
  '/deposit/addDeposit': '创建充值活动',
  '/abnormal': '异常资金',
  '/freeGiving': '赠送金额',
  '/freeGiving/add': '新建赠送规则',
  '/freeGiving/info': '详情'
}

class FundDisp extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  setStatusForfund = () => {
    this.clearStatus4fundIIlist()
  }
  clearStatus4fundIIlist = () => {
    this.getDefaultSchool()
    this.props.changeFund('fundList', {
      page: 1,
      type: 'all',
      status: 'all',
      selectKey: '',
      startTime: Time.get7DaysAgoStart(),
      endTime: Time.getTodayEnd(),
      userType: 'all'
    })
  }
  clearStatus4fundIIcashtime = () => {
    this.getDefaultSchool()
    this.props.changeFund('cashtime', { page: 1 })
  }
  clearStatus4fundIIcharge = () => {
    this.getDefaultSchool()
    this.props.changeFund('charge', { page: 1 })
  }
  clearStatus4fundIIdeposit = () => {
    this.getDefaultSchool()
    this.props.changeFund('deposit', { page: 1, schoolId: 'all' })
  }
  clearStatus4fundIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeFund('abnormal', {
      page: 1,
      selectKey: '',
      userType: 'all'
    })
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'),
      defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeFund('fundList', { schoolId: selectedSchool })
      this.props.changeFund('cashtime', { schoolId: selectedSchool })
      this.props.changeFund('charge', { schoolId: selectedSchool })
      this.props.changeFund('deposit', { schoolId: selectedSchool })
      this.props.changeFund('abnormal', { schoolId: selectedSchool })
    }
  }
  render() {
    const { forbiddenStatus } = this.props
    const {
      FUND_LIST_GET,
      FUND_WITHDRAW_DENO_GET,
      FUND_ABNORMAL_LIST_GET,
      FUND_GIVING_RULE_LIST_GET,
      FUND_WITHDRAW_TIMESET_GET,
      FUND_WITHDRAW_ACT_LIST_GET,
      FUND_CASH_LIST_GET
    } = forbiddenStatus
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="fund"
            setStatusForfund={this.setStatusForfund}
            clearStatus4fundIIlist={this.clearStatus4fundIIlist}
            clearStatus4fundIIcashtime={this.clearStatus4fundIIcashtime}
            clearStatus4fundIIcharge={this.clearStatus4fundIIcharge}
            clearStatus4fundIIdeposit={this.clearStatus4fundIIdeposit}
            clearStatus4fundIIabnormal={this.clearStatus4fundIIabnormal}
            parentName="资金管理"
          />
        </div>

        <div className="disp">
          <Switch>
            {FUND_WITHDRAW_ACT_LIST_GET ? null : (
              <Route
                path="/fund/deposit"
                render={props => (
                  <DepositContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            {FUND_WITHDRAW_DENO_GET ? null : (
              <Route
                path="/fund/charge"
                render={props => (
                  <ChargeContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}

            {FUND_WITHDRAW_TIMESET_GET ? null : (
              <Route
                path="/fund/cashtime"
                render={props => (
                  <CashtimeContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}

            {FUND_LIST_GET ? null : (
              <Route
                path="/fund/list"
                render={props => (
                  <RechargeContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            {FUND_CASH_LIST_GET ? null : (
              <Route
                path="/fund/withdrawList"
                render={props => (
                  <WithdrawContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            {FUND_ABNORMAL_LIST_GET ? null : (
              <Route
                path="/fund/abnormal"
                render={props => (
                  <AbnormalContainer
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            {FUND_GIVING_RULE_LIST_GET ? null : (
              <Route
                path="/fund/freeGiving"
                render={props => (
                  <FreeGiving
                    hide={this.props.hide}
                    {...props}
                    forbiddenStatus={forbiddenStatus}
                  />
                )}
              />
            )}
            <Route
              exact
              path="/fund"
              render={props => <Redirect to="/fund/list" />}
            />
          </Switch>
        </div>
      </div>
    )
  }
}
const mapStateToTableProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})
export default withRouter(
  connect(mapStateToTableProps, {
    changeFund
  })(FundDisp)
)
