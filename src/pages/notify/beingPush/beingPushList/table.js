import React from 'react'
import { Table } from 'antd'
import CONSTANTS from '../../../../constants'
import { beingsListPropsController } from '../controller'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../action'
const moduleName = 'notifyModule'
const subModule = 'beings'
const modalName = 'beingsModal'

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
  getColumns = () => {
    return [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '10%'
      },
      {
        title: '推送类型',
        dataIndex: 'pushtype'
      },
      {
        title: '推送环境',
        dataIndex: 'pushEqument'
      },
      {
        title: '推送对象',
        dataIndex: 'pushObj'
      },
      {
        title: '推送时间',
        dataIndex: 'pushTime'
      },
      {
        title: '推送内容',
        dataIndex: 'pushContent',
        width: '20%'
      },
      {
        title: '创建人',
        dataIndex: 'createPerson'
      },
      {
        title: '创建时间',
        dataIndex: 'createTime'
      },
      {
        title: '推送状态',
        dataIndex: 'pushStatus'
      },
      {
        title: '操作',
        dataIndex: 'operation'
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
