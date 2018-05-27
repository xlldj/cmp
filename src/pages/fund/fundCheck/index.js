import React from 'react'

import FundCheckList from './fundCheckList'
import FundCheckDetail from './fundCheckDetail'
import HandleModal from './handleModal'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../action'

const moduleName = 'fundModule'
const subModule = 'fundCheck'

class FundCheckContainer extends React.Component {
  render() {
    const { showDetail, showHandleModal } = this.props
    return (
      <div className="panelWrapper">
        <FundCheckList />
        {showDetail ? <FundCheckDetail /> : null}
        {showHandleModal ? <HandleModal /> : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    showHandleModal: state[moduleName][subModule].showHandleModal,
    showDetail: state[moduleName][subModule].showDetail
  }
}

export default withRouter(
  connect(mapStateToProps, { changeFund })(FundCheckContainer)
)
