import React from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'

import selectedImg from '../../../assets/selected.png'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
import { lostFoundListPropsController } from '../controller'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../../action'
const moduleName = 'lostModule'
const subModule = 'lostFoundList'
const modalName = 'lostModal'

const { PAGINATION: SIZE } = CONSTANTS

class LostFoundTable extends React.Component {
  setProps = event => {
    const value = lostFoundListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  selectRow = (record, index, event) => {
    let { dataSource } = this.props
    let selectedDetailId = dataSource[index].id
    this.props.changeLost(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      selectedDetailId
    })
  }
  getColumns = () => {
    const { selectedRowIndex } = this.props
    return [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol selectedHintWraper',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '登录账号',
        dataIndex: 'mobile'
      },
      {
        title: '手机型号',
        dataIndex: 'mobileBrand',
        width: '20%',
        render: (text, record) => {
          let result = ''
          if (record.mobileBrand) {
            result += record.mobileBrand
          }
          if (record.mobileModel) {
            result += `(${record.mobileModel})`
          }
          result = result ? result : '----'
          return result
        }
      },
      {
        title: '注册时间',
        dataIndex: 'createTime',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/user/userInfo/:${record.id}`}>详情</Link>
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
          onRowClick={this.selectRow}
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
    page: state[moduleName][subModule].page,
    selectedRowIndex: state[moduleName][subModule].selectedRowIndex
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(LostFoundTable)
)
