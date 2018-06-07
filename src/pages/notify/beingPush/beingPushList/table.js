import React from 'react'
import { Table, Badge, Popconfirm } from 'antd'
import { Link } from 'react-router-dom'
import CONSTANTS from '../../../../constants'
import { beingsListPropsController } from '../controller'
import Time from '../../../../util/time'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../action'
import { noticService } from '../../../service/index'
import { rePushList } from '../controller'
import Noti from '../../../../util/noti'
const moduleName = 'notifyModule'
const subModule = 'beings'
const modalName = 'beingsModal'
const {
  BEINGS_PUSH_STATUS,
  BEINGS_PUSH_EQUMENT,
  BEINGS_PUSH_TYPE,
  BEING_STATUSTEXT,
  PUSH_SUCCESS_STATUS,
  PUSH_ERROR_STATUS,
  PUSH_CANCEL_STATUS,
  PUSH_WAITE_STATUS,
  BEINGS_PUSH_PERSON
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
  cancelPush = id => {
    const body = {
      id: id
    }
    noticService.cancelPush(body).then(json => {
      if (json && json.data) {
        Noti.hintOk('操作成功', '取消发送成功')
        rePushList()
      }
    })
  }
  delete = (e, id) => {
    const body = {
      id: id
    }
    noticService.delPush(body).then(json => {
      if (json && json.data) {
        Noti.hintOk('操作成功', '删除成功')
        rePushList()
      }
    })
  }
  getColumns = () => {
    const { forbiddenStatus, type } = this.props
    const columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '12%'
      },
      {
        title: '推送类型',
        dataIndex: 'type',
        width: '8%',
        render: (text, record) => {
          return BEINGS_PUSH_TYPE[record.type]
        }
      },
      {
        title: '推送环境',
        dataIndex: 'env',
        width: '9%',
        render: (text, record) => {
          return BEINGS_PUSH_EQUMENT[record.env]
        }
      },
      {
        title: '推送对象',
        dataIndex: 'range',
        width: '8%',
        render: (text, record) => {
          return BEINGS_PUSH_PERSON[record.range]
            ? BEINGS_PUSH_PERSON[record.range]
            : record.username
        }
      },
      {
        title: '推送时间',
        width: '10%',
        dataIndex: 'planPushTime',
        render: (text, record) => {
          if (
            record.status === PUSH_SUCCESS_STATUS ||
            record.status === PUSH_ERROR_STATUS
          ) {
            return Time.getTimeStr(record.pushTime)
          } else {
            return Time.getTimeStr(text)
          }
        }
      },
      {
        title: '推送内容',
        dataIndex: 'content',
        width: '12%'
      },
      {
        title: '操作人',
        width: '8%',
        dataIndex: 'lastUpdateUserName'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: '10%',
        render: (text, record) => Time.getTimeStr(text)
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
          if (forbiddenStatus.ADD_EDIT_PUSH) {
            return <div className="editable-row-operations lastCol" />
          }
          const isEdit =
            record.status === PUSH_CANCEL_STATUS ||
            record.status === PUSH_WAITE_STATUS
          // record.status === PUSH_ERROR_STATUS
          const isDelete = record.status === PUSH_CANCEL_STATUS
          const isCancelPush = record.status === PUSH_WAITE_STATUS
          return (
            <div className="editable-row-operations lastCol">
              {isEdit ? (
                <Link
                  to={{
                    pathname: `/notify/beings/info/:${record.id}`,
                    state: {
                      id: record.id,
                      type: record.type
                    }
                  }}
                >
                  编辑
                </Link>
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
              {(isCancelPush && isEdit) || (isDelete && isCancelPush) ? (
                <span className="ant-divider" />
              ) : null}
              {isCancelPush ? (
                <Popconfirm
                  title="确定要取消推送此么?"
                  onConfirm={() => {
                    this.cancelPush(record.id)
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
    if (parseInt(type, 10) === CONSTANTS.BEING_PUSH_AUTO) {
      columns.splice(6, 1)
    }
    return columns
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
    page: state[moduleName][subModule].page,
    forbiddenStatus: state.setAuthenData.forbiddenStatus,
    type: state[moduleName][subModule].type
  }
}

export default withRouter(
  connect(mapStateToProps, { changeNotify })(BeingsTable)
)
