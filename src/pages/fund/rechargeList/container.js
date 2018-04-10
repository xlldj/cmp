import React from 'react'
import { Route, Switch } from 'react-router-dom'
import RechargeTableUi from './table.js'
import RechargeInfo from './info.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
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
    return (
      <div>
        <Switch>
          <Route
            path="/fund/list/info/:id"
            render={props => <RechargeInfo hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/fund/list"
            render={props => <FundTable hide={this.props.hide} {...props} />}
          />
          <Route
            exact
            path="/fund"
            render={props => <FundTable hide={this.props.hide} {...props} />}
          />
        </Switch>
      </div>
    )
  }
}

export default FundListContainer
