import React from 'react'
import { Route, Switch } from 'react-router-dom'
import WithdrawTableUi from './table.js'
import WithdrawInfo from './info.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'withdrawList'

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.fundModule[subModule].schoolId,
  status: state.fundModule[subModule].status,
  selectKey: state.fundModule[subModule].selectKey,
  page: state.fundModule[subModule].page,
  startTime: state.fundModule[subModule].startTime,
  endTime: state.fundModule[subModule].endTime,
  userType: state.fundModule[subModule].userType
})
const WithdrawTable = withRouter(
  connect(mapStateToProps, {
    changeFund
  })(WithdrawTableUi)
)

class FundListContainer extends React.Component {
  render() {
    const { forbiddenStatus } = this.props
    return (
      <div>
        <Switch>
          <Route
            path="/fund/withdrawList/info/:id"
            render={props => (
              <WithdrawInfo
                hide={this.props.hide}
                {...props}
                forbiddenStatus={forbiddenStatus}
              />
            )}
          />
          <Route
            exact
            path="/fund/withdrawList"
            render={props => (
              <WithdrawTable
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
