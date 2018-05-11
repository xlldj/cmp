import React from 'react'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { propsController } from './controller'
const moduleName = 'lostModule'
const subModule = 'lostFoundList'
const modalName = 'lostModal'

class CommentContent extends React.Component {
  render() {
    return <div className="" />
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedDetailId: state[moduleName][subModule].selectedDetailId,
    detail: state[modalName].detail,
    detailLoading: state[modalName].detailLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(CommentContent)
)
