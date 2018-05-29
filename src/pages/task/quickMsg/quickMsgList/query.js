import React from 'react'
import { checkObject } from '../../../../util/checkSame'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { QueryPanel, QueryLine, QueryBlock } from '../../../component/query'
import CheckSelector from '../../../component/checkSelect'
import { changeTask, fetchQuickList } from '../../action'
import { quickMsgPropsController } from '../controller'
import CONSTANTS from '../../../../constants/index'
const moduleName = 'taskModule'
const subModule = 'quickMsgList'
const { QUICK_MSGLIST_TYPE, PAGINATION: SIZE } = CONSTANTS
class QuickMsgListQuery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['type', 'page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  sendFetch(props) {
    props = props || this.props
    const { page, type } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (type !== 'all') {
      body.type = +type
    }
    props.fetchQuickList(body)
  }
  setProps = event => {
    const value = quickMsgPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  render() {
    const { type } = this.props
    return (
      <QueryPanel>
        <QueryLine>
          <QueryBlock>
            <span>类型筛选:</span>
            <CheckSelector
              allOptValue="all"
              allOptTitle="不限"
              options={QUICK_MSGLIST_TYPE}
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
  type: state[moduleName][subModule].type
})
export default withRouter(
  connect(mapStateToProps, { changeTask, fetchQuickList })(QuickMsgListQuery)
)
