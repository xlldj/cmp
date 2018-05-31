import React from 'react'
import { Table, Popconfirm } from 'antd'
import { checkObject } from '../../../../util/checkSame'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import { changeTask, fetchQuickTypeList } from '../../action'
import { quickMsgPropsController, deleteQuickType } from '../controller'
const { PAGINATION: SIZE } = CONSTANTS
const moduleName = 'taskModule'
const subModule = 'quickType'
const modalName = 'quickTypeModal'
class QuickMsgListTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.columns = [
      {
        title: '消息类型',
        dataIndex: 'description',
        className: 'firstCol'
      },
      {
        title: '创建人',
        dataIndex: 'operUserNickname'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        render: (text, record) => Time.getTimeStr(text)
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <a onClick={() => this.editQuickType(record)}> 编辑</a>
            </span>

            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此消息类型么?"
              onConfirm={e => {
                this.deleteQuickType(e, record.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        )
      }
    ]
  }
  deleteQuickType(event, id) {
    const body = {
      id: id
    }
    deleteQuickType(body)
  }
  editQuickType(record) {
    this.props.changeTask(subModule, {
      selectedType: record.id,
      isShowQuickTypeInfo: true,
      quickTypeInfoTitle: '编辑消息类型信息',
      editTypeInfo: true,
      selectRecord: record
    })
  }
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  sendFetch(props) {
    props = props || this.props
    const { page } = props
    const body = {
      page: page,
      size: SIZE
    }
    props.fetchQuickTypeList(body)
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
      <div className="tableList" style={{ marginTop: '10px' }}>
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
    selectRecord: state[moduleName][subModule].selectRecord
  }
}

export default withRouter(
  connect(mapStateToProps, { fetchQuickTypeList, changeTask })(
    QuickMsgListTable
  )
)
