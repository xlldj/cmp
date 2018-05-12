import React from 'react'

import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import CheckSelect from '../../../component/checkSelect'
import RangeSelect from '../../../component/rangeSelect'
import { checkObject } from '../../../../util/checkSame'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost, fetchLostFoundList } from '../../action'
import { lostFoundListPropsController } from '../controller'

import CONSTANTS from '../../../../constants'

const {
  LOST_FOUND_LIST_DAY_SELECT,
  LOSTTYPE,
  LOST_FOUND_STATUS,
  PAGINATION: SIZE
} = CONSTANTS
const moduleName = 'lostModule'
const modalName = 'lostModal'
const subModule = 'lostFoundList'

class LostFoundListQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: '',
      endTime: ''
    }
  }
  componentDidMount() {
    this.sendFetch()
  }
  sendFetch(props) {
    props = props || this.props
    const { page, day, type, status, startTime, endTime, schoolId } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (day) {
      body.day = +day
    } else {
      body.startTime = startTime
      body.endTime = endTime
    }
    if (schoolId !== 'all') {
      body.schoolId = +schoolId
    }
    if (type !== 'all') {
      body.type = +type
    }
    if (status !== 'all') {
      body.status = +status
    }
    props.fetchLostFoundList(body)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'startTime',
        'endTime',
        'type',
        'status',
        'schoolId',
        'page'
      ])
    ) {
      return
    }
    this.syncStateWithProps(nextProps)
    this.sendFetch(nextProps)
  }
  syncStateWithProps = props => {
    let { startTime, endTime } = props || this.props
    if (startTime !== this.state.startTime || endTime !== this.state.endTime) {
      this.setState({
        startTime,
        endTime
      })
    }
  }
  setProps = event => {
    const { listLoading } = this.props
    if (listLoading) {
      return
    }
    const value = lostFoundListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }
  render() {
    const { startTime, endTime } = this.state
    const { day, type, status, totalNormal, totalHidden } = this.props
    return (
      <QueryPanel>
        <QueryLine>
          <QueryBlock>
            <span>时间筛选:</span>
            <CheckSelect
              options={LOST_FOUND_LIST_DAY_SELECT}
              value={+day}
              onClick={v =>
                this.setProps({ type: 'day', value: { day: v, page: 1 } })
              }
            />
            <RangeSelect
              className="seperator"
              startTime={startTime}
              endTime={endTime}
              changeStartTime={v => this.setState({ startTime: v })}
              changeEndTime={v => this.setState({ endTime: v })}
              confirm={e => this.setProps({ type: 'syncTime' })}
            />
          </QueryBlock>
        </QueryLine>
        <QueryLine>
          <QueryBlock>
            <span>类型筛选:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={LOSTTYPE}
              value={type}
              onClick={v => this.setProps({ type: 'type', value: { type: v } })}
            />
          </QueryBlock>
        </QueryLine>
        <QueryLine>
          <QueryBlock>
            <span>显示状态:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={LOST_FOUND_STATUS}
              value={status}
              onClick={v =>
                this.setProps({ type: 'status', value: { status: v } })
              }
            />
          </QueryBlock>
          <QueryBlock>
            <span style={{ whiteSpace: 'nowrap' }}>
              当前正常显示: {totalNormal}条 已屏蔽: {totalHidden}条
            </span>
          </QueryBlock>
        </QueryLine>
      </QueryPanel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName].lostListContainer.schoolId,
    page: state[moduleName][subModule].page,
    day: state[moduleName][subModule].day,
    startTime: state[moduleName][subModule].startTime,
    endTime: state[moduleName][subModule].endTime,
    type: state[moduleName][subModule].type,
    status: state[moduleName][subModule].status,
    totalNormal: state[modalName].totalNormal,
    totalHidden: state[modalName].totalHidden,
    listLoading: state[modalName].listLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost, fetchLostFoundList })(
    LostFoundListQuery
  )
)
