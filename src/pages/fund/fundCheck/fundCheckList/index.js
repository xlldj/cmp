import React from 'react'

import Query from './query'
import FundCheckTable from './balanceTable'

import CONSTANTS from '../../../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../../actions'
const moduleName = 'fundModule'
const subModule = 'fundCheck'

class FundCheckList extends React.Component {
  render() {
    const { schoolId } = this.props
    return (
      <div className="panelWrapper">
        <Query />
        <FundCheckTable />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName][subModule].schoolId
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeFund
  })(FundCheckList)
)
