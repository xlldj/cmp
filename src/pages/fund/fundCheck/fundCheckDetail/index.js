import React from 'react'
import { checkObject } from '../../../../util/checkSame'

import LoadWrapper from '../../../component/loadWrapper'
import DetailHeader from '../../../component/detailHeader'
import FundCheckContent from './fundCheckContent'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund, fetchFundCheckInfo } from '../../action'
import { fundCheckDetailPropsController } from '../controller'
const moduleName = 'fundModule'
const subModule = 'fundCheck'
const modalName = 'fundCheckModal'

class FundCheckDetail extends React.Component {
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
    props.fetchFundCheckInfo(body)
  }
  back = () => {
    this.props.history.goBack()
  }

  setProps = event => {
    const value = fundCheckDetailPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeFund(subModule, value)
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
    let { detailLoading, selectedDetailId, noRight2Handle } = this.props

    return (
      <div
        className="detailPanelWrapper lostFoundDetail"
        style={{ width: '50%' }}
        ref="detailWrapper"
      >
        {detailLoading ? <LoadWrapper /> : null}
        <DetailHeader close={e => this.closeDetail(e, true)} />
        <div className="detailPanel-content">
          <FundCheckContent noRight2Handle={noRight2Handle} {...this.props} />
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
    noRight2Handle: state.setAuthenData.forbiddenStatus.HANDLE_FUND_CHECK
  }
}

export default withRouter(
  connect(mapStateToProps, { fetchFundCheckInfo, changeFund })(FundCheckDetail)
)
