import React from 'react'
import { Route, Switch } from 'react-router-dom'
import RechargeTableUi from './table.js'
// import RechargeInfo from './info.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
import FundInfo from './info.js'
const subModule = 'fundList'

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.fundModule[subModule].schoolId,
  type: state.fundModule[subModule].type,
  status: state.fundModule[subModule].status,
  selectKey: state.fundModule[subModule].selectKey,
  page: state.fundModule[subModule].page,
  startTime: state.fundModule[subModule].startTime,
  endTime: state.fundModule[subModule].endTime,
  userType: state.fundModule[subModule].userType
})
const FundTable = withRouter(
  connect(mapStateToProps, {
    changeFund
  })(RechargeTableUi)
)

class FundListContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    const { FUND_LIST_GET, FUND_RECHARGE_DETAIL } = forbiddenStatus
    return (
      <div>
        <Switch>
          {FUND_LIST_GET ? null : (
            <Route
              exact
              path="/fund/list"
              render={props => (
                <FundTable
                  hide={this.props.hide}
                  {...props}
                  forbiddenStatus={forbiddenStatus}
                />
              )}
            />
          )}
          {FUND_RECHARGE_DETAIL ? null : (
            <Route
              path="/fund/list/info/:id"
              render={props => (
                <FundInfo
                  {...props}
                  hide={this.props.hide}
                  forbiddenStatus={forbiddenStatus}
                />
              )}
            />
          )}
          <Route
            exact
            path="/fund"
            render={props => (
              <FundTable
                hide={this.props.hide}
                {...props}
                forbiddenStatus={forbiddenStatus}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default FundListContainer
