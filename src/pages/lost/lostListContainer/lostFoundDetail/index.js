import React from 'react'
import { checkObject } from '../../../../util/checkSame'

import LoadWrapper from '../../../component/loadWrapper'
import DetailHeader from '../../../component/detailHeader'
import LostContent from './lostContent'
import Comment from './comment'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost, fetchLostInfo } from '../../action'
import { lostFoundDetailPropsController } from '../controller'
const moduleName = 'lostModule'
const subModule = 'lostFoundList'
const modalName = 'lostModal'

class LostFoundDetail extends React.Component {
  componentDidMount() {
    this.sendFetch()
    let root = document.getElementById('root')
    this.root = root
    root.addEventListener('click', this.closeDetail, false)
  }
  componentWillUnmount() {
    this.root.removeEventListener('click', this.closeDetail)
  }
  componentWillReceiveProps(nextProps) {
    try {
      if (checkObject(this.props, nextProps, ['selectedDetailId'])) {
        return
      }
      this.sendFetch(nextProps)
    } catch (e) {
      console.log(e)
    }
  }
  sendFetch(props) {
    props = props || this.props
    const body = {
      id: props.selectedDetailId
    }
    props.fetchLostInfo(body)
  }
  back = () => {
    this.props.history.goBack()
  }

  setProps = event => {
    const value = lostFoundDetailPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }

  closeDetail = (e, force) => {
    if (!this.props.showDetail) {
      return
    }
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target) && !force) {
      return
    }
    if (this.props.showDetail) {
      this.setProps({
        type: 'toggleDetail',
        value: {
          showDetail: false,
          selectedRowIndex: -1,
          selectedDetailId: -1
        }
      })
    }
  }
  render() {
    let {
      detail: data,
      detailLoading,
      selectedDetailId,
      forbiddenStatus
    } = this.props
    const { LOST_COMMENTS_LIST } = forbiddenStatus

    return (
      <div className="detailPanelWrapper lostFoundDetail" ref="detailWrapper">
        {detailLoading ? <LoadWrapper /> : null}
        <DetailHeader close={e => this.closeDetail(e, true)} />
        <div className="detailPanel-content">
          <LostContent data={data} {...this.props} />
          {LOST_COMMENTS_LIST ? null : (
            <Comment selectedDetailId={selectedDetailId} {...this.props} />
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    selectedDetailId: state[moduleName][subModule].selectedDetailId,
    detail: state[modalName].detail,
    detailLoading: state[modalName].detailLoading,
    showDetail: state[moduleName][subModule].showDetail,
    forbiddenStatus: state.setAuthenData.forbiddenStatus
  }
}

export default withRouter(
  connect(mapStateToProps, { fetchLostInfo, changeLost })(LostFoundDetail)
)
