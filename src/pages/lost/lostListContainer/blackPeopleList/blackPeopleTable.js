import React from 'react'
import { Table } from 'antd'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
import { lostFoundListPropsController } from '../controller'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../../action'
const modalName = 'blackModal'

const { PAGINATION: SIZE, LOSTTYPE, HiddenStatus, showStatus } = CONSTANTS

class BlackPeopleTable extends React.Component {
  setProps = event => {
    const value = lostFoundListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(modalName, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  getColumns = () => {
    return [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol',
        render: (text, record, index) => <span className="">{text}</span>
      },
      {
        title: '用户手机号',
        dataIndex: 'userMobile',
        render: (text, record) => (
          <span className="">
            {LOSTTYPE[record.type] ? LOSTTYPE[record.type] : '----'}
          </span>
        )
      },
      {
        title: '用户昵称',
        dataIndex: 'userNickname',
        width: '20%',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '拉黑时间',
        dataIndex: 'createTime',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: '拉黑时常',
        dataIndex: 'blackListInfo',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '操作人',
        dataIndex: 'operUserNickname',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/user/userInfo/:${record.userId}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }
  render() {
    const { dataSource, total, loading, page } = this.props
    return (
      <div className="tableList">
        <p className="profitBanner">当前拉黑人数: {total}人</p>
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
          columns={this.getColumns()}
          onChange={this.changePage}
          rowClassName={this.setRowClass}
        />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    total: state[modalName].totalNormal,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading,
    page: state[modalName].page
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(BlackPeopleTable)
)
