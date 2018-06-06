import React from 'react'
import { checkObject } from '../../../../util/checkSame'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import CheckSelector from '../../../component/checkSelect'
import { changeTask, fetchQuickList, fetchQuickTypeList } from '../../action'
import { quickMsgPropsController } from '../controller'
import CONSTANTS from '../../../../constants/index'
const moduleName = 'taskModule'
const subModule = 'quickMsgList'
const modalName = 'quickTypeModal'
const { PAGINATION: SIZE } = CONSTANTS
class QuickMsgListQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.sendFetch()
    const json = {
      page: 1,
      size: 10000
    }
    this.props.fetchQuickTypeList(json)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['type', 'page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  //获取消息列表
  sendFetch(props) {
    props = props || this.props
    const { page, type } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (type !== 'all') {
      body.msgType = +type
    }
    props.fetchQuickList(body)
  }
  setProps = event => {
    const value = quickMsgPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  //类型筛选数据
  getMsgList() {
    const { quickTypeList } = this.props
    const quickTypes = {}
    quickTypeList.forEach((quickType, index) => {
      quickTypes[quickType.id] = quickType.description
    })
    return quickTypes
  }
  render() {
    const { type } = this.props
    return (
      <QueryPanel>
        <QueryLine>
          <QueryBlock style={{ alignItems: 'flex-start' }}>
            <span style={{ marginTop: '7px' }}>类型筛选:</span>
            <CheckSelector
              allOptValue="all"
              allOptTitle="不限"
              options={this.getMsgList()}
              value={type}
              onClick={v => this.setProps({ type: 'type', value: { type: v } })}
            />
          </QueryBlock>
        </QueryLine>
      </QueryPanel>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  type: state[moduleName][subModule].type,
  quickTypeList: state[modalName].list
})
export default withRouter(
  connect(mapStateToProps, { changeTask, fetchQuickList, fetchQuickTypeList })(
    QuickMsgListQuery
  )
)
