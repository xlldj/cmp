import React from 'react'

import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import CheckSelect from '../../../component/checkSelect'
import SchoolSelector from '../../../component/schoolSelector'
import { checkObject } from '../../../../util/checkSame'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund, fetchFundCheckList } from '../../../../actions'
import { fundCheckListPropsController } from '../controller'

import CONSTANTS from '../../../../constants'

const {
  FUND_MISTAKE_TYPE,
  FUND_MISTAKE_STATUS,
  FUND_MISTAKE_METHOD,
  PAGINATION: SIZE
} = CONSTANTS
const moduleName = 'fundModule'
const subModule = 'fundCheck'
const modalName = 'fundCheckModal'

class FundCheckQuery extends React.Component {
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
    props.fetchFundCheckList(body)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'type',
        'status',
        'schoolId',
        'page',
        'method'
      ])
    ) {
      return
    }
    this.sendFetch(nextProps)
  }
  setProps = event => {
    const { listLoading } = this.props
    if (listLoading) {
      return
    }
    const value = fundCheckListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeFund(subModule, value)
    }
  }
  render() {
    const { type, status, method, schoolId, total } = this.props
    return (
      <QueryPanel>
        <QueryLine>
          <QueryBlock>
            <span>异常类型:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={FUND_MISTAKE_TYPE}
              value={type}
              onClick={v =>
                this.setProps({ type: 'type', value: { type: v, page: 1 } })
              }
            />
          </QueryBlock>
        </QueryLine>
        <QueryLine>
          <QueryBlock>
            <span>处理状态:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={FUND_MISTAKE_STATUS}
              value={status}
              onClick={v =>
                this.setProps({ type: 'status', value: { status: v, page: 1 } })
              }
            />
          </QueryBlock>
          <QueryBlock>
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={v =>
                this.setProps({
                  type: 'school',
                  value: { schoolId: v, page: 1 }
                })
              }
            />
          </QueryBlock>
        </QueryLine>
        <QueryLine>
          <QueryBlock>
            <span>处理状态:</span>
            <CheckSelect
              allOptValue="all"
              allOptTitle="不限"
              options={FUND_MISTAKE_METHOD}
              value={method}
              onClick={v =>
                this.setProps({ type: 'method', value: { method: v } })
              }
            />
          </QueryBlock>
          <QueryBlock>
            <span style={{ whiteSpace: 'nowrap' }}>
              当前筛选条数: {total}条
            </span>
          </QueryBlock>
        </QueryLine>
      </QueryPanel>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName][subModule].schoolId,
    page: state[moduleName][subModule].page,
    type: state[moduleName][subModule].type,
    status: state[moduleName][subModule].status,
    method: state[moduleName][subModule].method,
    listLoading: state[modalName].listLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { changeFund, fetchFundCheckList })(FundCheckQuery)
)
