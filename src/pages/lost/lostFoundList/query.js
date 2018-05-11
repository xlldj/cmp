import React from 'react'

import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import CheckSelect from '../../component/checkSelect'
import RangeSelect from '../../component/rangeSelect'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import {
  changeType,
  changeStatus,
  stateController,
  propsController
} from './controller'

import CONSTANTS from '../../../constants'

const { LOST_FOUND_LIST_DAY_SELECT, LOSTTYPE, LOST_FOUND_STATUS } = CONSTANTS
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
  handleState = ({ type, value } = { type: '', value: {} }) => {
    if (type === 'startTime' || type === 'endTime') {
      this.setState((prevState, props) => stateController(prevState, value))
    }
  }
  setProps = action => {
    const value = propsController(this.state, this.props, action)
    this.props.changeLost(subModule, value)
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
              changeStartTime={v =>
                this.handleState({ type: 'startTime', value: { startTime: v } })
              }
              changeEndTime={v =>
                this.handleState({ key: 'endTime', value: v })
              }
              confirm={this.setProps({ type: 'syncTime' })}
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
              onClick={changeStatus}
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
    day: state[moduleName][subModule].day,
    startTime: state[moduleName][subModule].startTime,
    endTime: state[moduleName][subModule].endTime,
    type: state[moduleName][subModule].type,
    status: state[moduleName][subModule].status,
    totalNormal: state[modalName].totalNormal,
    totalHidden: state[modalName].totalHidden
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(LostFoundListQuery)
)
