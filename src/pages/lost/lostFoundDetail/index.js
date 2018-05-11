import React from 'react'
import { checkObject } from '../../../util/checkSame'

import LoadWrapper from '../../component/loadWrapper'
import DetailHeader from '../../component/detailHeader'
import LostContent from './lostContent'
import Comment from './comment'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { propsController } from './controller'
const moduleName = 'lostModule'
const subModule = 'lostFoundList'
const modalName = 'lostModal'

class LostFoundDetail extends React.Component {
  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    try {
      if (checkObject(this.props, nextProps, ['selectedDetailId'])) {
        return
      }
      this.fetchData(nextProps)
    } catch (e) {
      console.log(e)
    }
  }
  back = () => {
    this.props.history.goBack()
  }

  setProps = event => {
    const value = propsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }

  closeDetail = e => {
    if (!this.props.showDetail) {
      return
    }
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      return
    }
    if (this.props.showDetail) {
      this.props.changeLost(subModule, {
        showDetail: false,
        selectedRowIndex: -1,
        selectedDetailId: -1
      })
    }
  }
  render() {
    let { detail: data, detailLoading } = this.props

    return (
      <div className="detailPanelWrapper lostFoundDetail" ref="detailWrapper">
        {detailLoading ? <LoadWrapper /> : null}
        <DetailHeader close={e => this.setProps({ type: 'closeDetail' })} />
        <LostContent data={data} />
        <Comment />
      </div>
    )
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
  connect(mapStateToProps, { changeLost })(LostFoundDetail)
)
