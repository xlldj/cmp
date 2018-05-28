import React from 'react'

import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import CheckSelect from '../../../component/checkSelect'
import SchoolSelector from '../../../component/schoolSelector'
import { checkObject } from '../../../../util/checkSame'
import { Button } from 'antd'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify, fetchBeingPushList } from '../../../../actions'
import { beingsListPropsController } from '../controller'

import CONSTANTS from '../../../../constants'

const {
  BEINGS_PUSH_STATUS,
  BEINGS_PUSH_EQUMENT,
  BEINGS_PUSH_TYPE,
  PAGINATION: SIZE
} = CONSTANTS
const moduleName = 'notifyModule'
const subModule = 'beings'
const modalName = 'beingsModal'

class BeingsQuery extends React.Component {
  componentDidMount() {
    this.sendFetch()
  }
  sendFetch(props) {
    props = props || this.props
    const { page, type, status, schoolId, method } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = +schoolId
    }
    if (type !== 'all') {
      body.mode = +type
    }
    if (status !== 'all') {
      body.status = +status
    }
    if (method !== 'all') {
      body.env = +method
    }
    props.fetchBeingPushList(body)
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
    const value = beingsListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeNotify(subModule, value)
    }
  }
  goAddBeing = () => {
    this.props.history.push({
      pathname: `/notify/beings/addbeing`,
      state: { path: 'fromInfoSet' }
    })
  }
  render() {
    const { type, status, method, schoolId, total } = this.props
    return (
      <div>
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <Button
                type="primary"
                className="addSchoolBtn"
                style={{ height: '30px !important' }}
                onClick={this.goAddBeing}
              >
                创建消息推送
              </Button>
            </QueryBlock>
            <QueryBlock>
              <SchoolSelector
                selectedSchool={schoolId}
                changeSchool={v =>
                  this.setProps({
                    type: 'schoolId',
                    value: { schoolId: v, page: 1 }
                  })
                }
              />
            </QueryBlock>
          </QueryLine>
          <QueryLine>
            <QueryBlock>
              <span>推送类型:</span>
              <CheckSelect
                options={BEINGS_PUSH_TYPE}
                value={type}
                onClick={v =>
                  this.setProps({ type: 'type', value: { type: v, page: 1 } })
                }
              />
            </QueryBlock>
          </QueryLine>
          <QueryLine>
            <QueryBlock>
              <span>推送环境:</span>
              <CheckSelect
                allOptValue="all"
                allOptTitle="不限"
                options={BEINGS_PUSH_EQUMENT}
                value={method}
                onClick={v =>
                  this.setProps({
                    type: 'method',
                    value: { method: v, page: 1 }
                  })
                }
              />
            </QueryBlock>
          </QueryLine>
          <QueryLine>
            <QueryBlock>
              <span>推送状态:</span>
              <CheckSelect
                allOptValue="all"
                allOptTitle="不限"
                options={BEINGS_PUSH_STATUS}
                value={status}
                onClick={v =>
                  this.setProps({ type: 'status', value: { status: v } })
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
      </div>
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
    total: state[modalName].total
  }
}

export default withRouter(
  connect(mapStateToProps, { changeNotify, fetchBeingPushList })(BeingsQuery)
)
