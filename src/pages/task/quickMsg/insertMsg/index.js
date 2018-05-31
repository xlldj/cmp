import React from 'react'
import { connect } from 'react-redux'
import { Modal, Pagination, Spin } from 'antd'
import { checkObject } from '../../../../util/checkSame'
import { withRouter } from 'react-router-dom'
import { changeTask, fetchQuickList, fetchQuickTypeList } from '../../action'
import BasicSelector from '../../../component/basicSelectorWithoutAll'
const moduleName = 'taskModule'
const subModule = 'insertMsgList'
const modalName = 'quickModal'
const typeModalName = 'quickTypeModal'
const pageSize = 5
class InsertMsgContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  chooseMsg(content) {
    this.props.chooseMsg(content)
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
  changePage = page => {
    this.props.changeTask(subModule, {
      page: page
    })
  }
  sendFetch(props) {
    props = props || this.props
    const { page, type } = props
    const body = {
      page: page,
      size: pageSize
    }
    if (type !== 'all') {
      body.msgType = +type
    }
    props.fetchQuickList(body)
  }
  quickMsgContent() {
    const { dataSource } = this.props
    const content =
      dataSource &&
      dataSource.map((msgItem, index) => {
        return (
          <li
            className="msgItem"
            key={`label${index}`}
            onClick={() => this.chooseMsg(msgItem.content)}
          >
            {msgItem.content}
          </li>
        )
      })
    return content
  }
  changetype = v => {
    if (v !== 'all') {
      this.props.changeTask(subModule, {
        type: v
      })
    }
  }
  closeInsertModal = () => {
    this.props.closeInsertModal()
  }
  getTypes(types) {
    const typeOptions = {}
    types.forEach((type, index) => {
      typeOptions[type.id] = type.description
    })
    return typeOptions
  }
  render() {
    let { types, type, page, total, loading } = this.props
    const msgList = this.quickMsgContent()
    types = this.getTypes(types)
    console.log(types)
    return (
      <Modal
        wrapClassName="modal buildTask"
        width={450}
        title="插入快捷消息"
        visible={true}
        onCancel={this.closeInsertModal}
        footer={null}
        okText=""
      >
        <div className="info msgInfo">
          <ul>
            <li>
              <BasicSelector
                staticOpts={types}
                width={150}
                selectedOpt={type}
                changeOpt={this.changetype}
                invalidTitle="选择消息类型"
              />
            </li>
            <div className="msgListDiv">
              {loading ? <Spin /> : <div>{msgList ? msgList : null}</div>}
            </div>
          </ul>
        </div>
        <Pagination
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={this.changePage}
        />
      </Modal>
    )
  }
}
const mapStateToProps = (state, OwnProps) => ({
  total: state[modalName].total,
  dataSource: state[modalName].list,
  loading: state[modalName].listLoading,
  page: state[moduleName][subModule].page,
  type: state[moduleName][subModule].type,
  types: state[typeModalName].list,
  isShowInsert: state[moduleName][subModule].isShowInsert
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    fetchQuickList,
    fetchQuickTypeList
  })(InsertMsgContainer)
)
