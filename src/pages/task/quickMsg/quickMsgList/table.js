import React from 'react'
import { Table, Popconfirm } from 'antd'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CONSTANTS from '../../../../constants'
import { changeTask } from '../../action'
import Time from '../../../../util/time'
import { quickMsgPropsController, deleteQuickMsg } from '../controller'
const { PAGINATION: SIZE } = CONSTANTS
const moduleName = 'taskModule'
const subModule = 'quickMsgList'
const modalName = 'quickModal'
class QuickMsgListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    const { forbiddenStatus } = props
    const { ADD_EDIT_DEL_QUICKMSG } = forbiddenStatus
    this.columns = [
      {
        title: '消息类型',
        dataIndex: 'msgTypeDesc',
        className: 'firstCol',
        width: '10%'
      },
      {
        title: '快捷消息',
        dataIndex: 'content',
        width: '50%'
      },
      {
        title: <p className="center">操作人</p>,
        dataIndex: 'operUserNickname',
        width: '10%',
        render: (text, record) => <p className="center">{text}</p>
      },
      {
        title: <p className="center">更新时间</p>,
        dataIndex: 'updateTime',
        width: '10%',
        render: (text, record) => (
          <p className="center">{Time.getTimeStr(text)}</p>
        )
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            {ADD_EDIT_DEL_QUICKMSG ? null : (
              <span>
                <span>
                  <a onClick={() => this.editQuickMsg(record)}> 编辑</a>
                </span>

                <span className="ant-divider" />
                <Popconfirm
                  title="确定要删除此消息类型么?"
                  onConfirm={e => {
                    this.deleteQuickMsg(e, record.id)
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">删除</a>
                </Popconfirm>
              </span>
            )}
          </div>
        )
      }
    ]
  }
  //删除快捷消息
  deleteQuickMsg = (event, id) => {
    const body = {
      id: id
    }
    deleteQuickMsg(body)
  }
  //编辑快捷消息
  editQuickMsg = record => {
    this.props.changeTask(subModule, {
      selectedMsg: record.id,
      isShowQuickInfo: true,
      quickInfoTitle: '编辑消息信息',
      editMsg: true,
      selectRecord: record
    })
  }
  setProps = event => {
    const value = quickMsgPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  changeTable = pageObj => {
    let page = pageObj.current
    if (page !== this.props.page) {
      this.setProps({ type: 'page', value: { page } })
    }
  }
  render() {
    const { dataSource, total, loading, page } = this.props
    return (
      <div className="tableList">
        <Table
          bordered
          showQuickJumper
          loading={loading}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total,
            showQuickJumper: true
          }}
          dataSource={dataSource}
          rowKey={record => record.id}
          columns={this.columns}
          onChange={this.changeTable}
        />
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    total: state[modalName].total,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading,
    page: state[moduleName][subModule].page,
    selectRecord: state[moduleName][subModule].selectRecord,
    forbiddenStatus: state.setAuthenData.forbiddenStatus
  }
}

export default withRouter(
  connect(mapStateToProps, { changeTask })(QuickMsgListTable)
)
