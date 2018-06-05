import React from 'react'

import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import CheckSelect from '../../component/checkSelect'
import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput'
import { checkObject } from '../../../util/checkSame'

import { taskListQueryPropsController } from './controller'

import CONSTANTS from '../../../constants'

const {
  TASKTYPES,
  TIMELABEL,
  TIMERANGESELECTS,
  TAB_TO_REDUX_NAME,
  TASK_LIST_TAB_FINISHED
} = CONSTANTS

class TaskListQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: '',
      endTime: '',
      searchingText: ''
    }
    this.syncStateWithProps()
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'startTime',
        'endTime',
        'type',
        'selectKey',
        'page',
        'schoolId',
        'mine'
      ])
    ) {
      return
    }
    this.syncStateWithProps(nextProps)
  }
  syncStateWithProps = props => {
    props = props || this.props
    const { tabIndex } = props
    const reduxStateName = TAB_TO_REDUX_NAME[tabIndex]
    const currentReduxState = props[reduxStateName]

    let { startTime, endTime, selectKey } = currentReduxState
    if (startTime !== this.state.startTime || endTime !== this.state.endTime) {
      this.setState({
        startTime,
        endTime
      })
    }
    if (selectKey !== this.state.searchingText) {
      this.setState({
        searchingText: selectKey
      })
    }
  }
  setProps = event => {
    const { listLoading, tabIndex } = this.props
    if (listLoading) {
      return
    }
    const value = taskListQueryPropsController(this.state, this.props, event)
    const subModule = TAB_TO_REDUX_NAME[tabIndex]
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  confirmSearch = () => {
    this.setProps({
      type: 'selectKey',
      value: { selectKey: this.state.searchingText, page: 1 }
    })
  }

  render() {
    const { startTime, endTime, searchingText } = this.state
    const { tabIndex, total } = this.props
    const reduxStateName = TAB_TO_REDUX_NAME[tabIndex]
    const currentReduxState = this.props[reduxStateName]
    const { type, day } = currentReduxState
    return (
      <QueryPanel>
        <QueryLine>
          <QueryBlock>
            <span>{TIMELABEL[tabIndex]}:</span>
            <CheckSelect
              allOptTitle={tabIndex !== TASK_LIST_TAB_FINISHED ? '不限' : ''}
              allOptValue={tabIndex !== TASK_LIST_TAB_FINISHED ? 'all' : ''}
              options={TIMERANGESELECTS[tabIndex]}
              value={day}
              onClick={v =>
                this.setProps({
                  type: 'day',
                  value: { day: v, page: 1, startTime: '', endTime: '' }
                })
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
          <QueryBlock>
            <SearchInput
              placeholder="用户"
              searchingText={searchingText}
              pressEnter={this.confirmSearch}
              changeSearch={this.changeSearch}
            />
          </QueryBlock>
        </QueryLine>
        <QueryLine>
          <QueryBlock>
            <span>任务类型:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={TASKTYPES}
              value={type}
              onClick={v =>
                this.setProps({ type: 'type', value: { type: v, page: 1 } })
              }
            />
          </QueryBlock>
          <QueryBlock>
            <span className="mgr10">当前工单总条数:{total}</span>
          </QueryBlock>
        </QueryLine>
      </QueryPanel>
    )
  }
}

export default TaskListQuery
