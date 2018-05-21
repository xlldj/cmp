import React from 'react'
import { Table } from 'antd'

import selectedImg from '../../../assets/selected.png'
import Time from '../../../../util/time'
import { notEmpty } from '../../../../util/types'
import CONSTANTS from '../../../../constants'
import { fundCheckListPropsController } from '../controller'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../action'
const moduleName = 'fundModule'
const subModule = 'fundCheck'
const modalName = 'fundCheckModal'

const {
  PAGINATION: SIZE,
  FUNDTYPE,
  FUND_MISTAKE_TYPE,
  FUND_MISTAKE_METHOD,
  FUND_MISTAKE_STATUS,
  FUND_CHECK_MISTAKES
} = CONSTANTS

class FundCheckTable extends React.Component {
  setProps = event => {
    const value = fundCheckListPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeFund(subModule, value)
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setProps({ type: 'page', value: { page } })
  }
  selectRow = (record, index, event) => {
    let { dataSource } = this.props
    let selectedDetailId = dataSource[index].id
    this.props.changeFund(subModule, {
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
        title: '类型',
        dataIndex: 'orderType',
        width: '10%',
        render: (text, record) => FUNDTYPE[record.orderType]
      },
      {
        title: '异常类型',
        dataIndex: 'mistakeType',
        width: '10%',
        render: (text, record) =>
          notEmpty(record.mistakeType)
            ? FUND_MISTAKE_TYPE[record.mistakeType]
            : ''
      },
      {
        title: '异常原因',
        dataIndex: 'mistakeReason',
        width: '10%',
        render: (text, record) => FUND_CHECK_MISTAKES[record.mistakeReason]
      },
      {
        title: '异常金额',
        dataIndex: 'mistakeAmount',
        width: '10%',
        render: (text, record) =>
          notEmpty(record.mistakeAmount) ? (
            <span className="shalowRed">¥{record.mistakeAmount}</span>
          ) : null
      },
      {
        title: '订单创建时间',
        dataIndex: 'orderCreateTime',
        width: '10%',
        render: (text, record, index) => {
          return record.orderCreateTime
            ? Time.getTimeStr(record.orderCreateTime)
            : ''
        }
      },
      {
        title: '处理方式',
        dataIndex: 'settleMethod',
        width: '10%',
        render: (text, record) =>
          notEmpty(record.settleMethod)
            ? FUND_MISTAKE_METHOD[record.settleMethod]
            : ''
      },
      {
        title: '处理状态',
        dataIndex: 'settleStatus',
        width: '10%',
        render: (text, record) =>
          notEmpty(record.settleStatus)
            ? FUND_MISTAKE_STATUS[record.settleStatus]
            : ''
      },
      {
        title: '处理人',
        dataIndex: 'settleUser'
      },
      {
        title: '处理时间',
        dataIndex: 'settleTime',
        render: (text, record, index) => {
          return notEmpty(record.settleTime)
            ? Time.getTimeStr(record.settleTime)
            : ''
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
    total: state[modalName].total,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading,
    page: state[moduleName][subModule].page,
    selectedRowIndex: state[moduleName][subModule].selectedRowIndex
  }
}

export default withRouter(
  connect(mapStateToProps, { changeFund })(FundCheckTable)
)
