import React from 'react'
import { Table, Badge, Popconfirm } from 'antd'
import { Link } from 'react-router-dom'
import CONSTANTS from '../../../../constants'
import { beingsListPropsController } from '../controller'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../action'
const moduleName = 'notifyModule'
const subModule = 'beings'
const modalName = 'beingsModal'
const {
  BEINGS_PUSH_STATUS,
  BEINGS_PUSH_EQUMENT,
  BEINGS_PUSH_TYPE,
  BEING_STATUSTEXT,
  PUSH_ERROR_STATUS,
  PUSH_CANCEL_STATUS,
  PUSH_WAITE_STATUS
} = CONSTANTS
const { PAGINATION: SIZE } = CONSTANTS

class BeingsTable extends React.Component {
  setProps = event => {
    const value = beingsListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeNotify(subModule, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  cancel = (e, id) => {
    const body = {
      id: id
    }
  }
  delete = (e, id) => {
    const body = {
      id: id
    }
  }
  getColumns = () => {
    return [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '推送类型',
        dataIndex: 'type',
        render: (text, record) => {
          return BEINGS_PUSH_TYPE[record.type]
        }
      },
      {
        title: '推送环境',
        dataIndex: 'env',
        render: (text, record) => {
          return BEINGS_PUSH_EQUMENT[record.env]
        }
      },
      {
        title: '推送对象',
        dataIndex: 'target'
      },
      {
        title: '推送时间',
        dataIndex: 'planPushTime'
      },
      {
        title: '推送内容',
        dataIndex: 'content',
        width: '15%'
      },
      {
        title: '操作人',
        dataIndex: 'creatorName'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime'
      },
      {
        title: '推送状态',
        dataIndex: 'status',
        width: '10%',
        render: (text, record) => (
          <Badge
            text={record.status ? BEINGS_PUSH_STATUS[record.status] : null}
            status={record.status ? BEING_STATUSTEXT[record.status] : 'error'}
          />
        )
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '15%',
        render: (text, record, index) => {
          const isEdit =
            record.status === PUSH_CANCEL_STATUS ||
            record.status === PUSH_WAITE_STATUS
          const isDelete =
            record.status === PUSH_ERROR_STATUS ||
            record.status === PUSH_CANCEL_STATUS
          const isRePush = record.status === PUSH_WAITE_STATUS
          return (
            <div className="editable-row-operations lastCol">
              {isEdit ? (
                <Link to={`/notify/beings/info/:${record.id}`}>编辑</Link>
              ) : null}
              {isEdit && isDelete ? <span className="ant-divider" /> : null}
              {isDelete ? (
                <Popconfirm
                  title="确定要删除此么?"
                  onConfirm={e => {
                    this.delete(e, record.id)
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">删除</a>
                </Popconfirm>
              ) : null}
              {(isRePush && isEdit) || (isDelete && isRePush) ? (
                <span className="ant-divider" />
              ) : null}
              {isRePush ? (
                <Popconfirm
                  title="确定要取消推送此么?"
                  onConfirm={e => {
                    this.cancel(e, record.id)
                  }}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">取消推送</a>
                </Popconfirm>
              ) : null}
            </div>
          )
        }
      }
    ]
  }
  render() {
    const { dataSource, total, loading, page } = this.props

    return (
      <div className="tableList">
        <Table
          bordered
          loading={loading}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          dataSource={dataSource}
          rowKey={record => record.id}
          columns={this.getColumns()}
          onChange={this.changePage}
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
    page: state[moduleName][subModule].page
  }
}

export default withRouter(
  connect(mapStateToProps, { changeNotify })(BeingsTable)
)
