import React from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'antd'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'

const {
  FUNDTYPE,
  ACCOUNTTYPE,
  REMOTE_ORDER_STATUS_SUCCESS,
  WITHDRAWSTATUS
} = CONSTANTS

class FundCheckDetailTables extends React.Component {
  localOrderColumns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: '20%',
      render: (text, record) => (
        <Link
          to={{ pathname: `/fund/list/info/:${record.id}` }}
          className="softLink"
        >
          {record.orderNo}
        </Link>
      )
    },
    {
      title: '用户',
      dataIndex: 'userPhone',
      width: '10%',
      render: (text, record) => (
        <Link
          to={{ pathname: `/fund/list/info/:${record.userId}` }}
          className="softLink"
        >
          {record.userPhone}
        </Link>
      )
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      width: '10%',
      render: (text, record) => (
        <span>
          {record.orderType !== null ? FUNDTYPE[record.orderType] : ''}
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: '10%',
      render: (text, record) =>
        record.amount !== null ? (
          <span className="shalowRed">¥{record.amount}</span>
        ) : (
          <span>未知</span>
        )
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      width: '10%',
      render: (text, record) => (
        <span>{WITHDRAWSTATUS[record.orderStatus] || '未知'}</span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '10%',
      render: (text, record, index) => (
        <span>
          {record.createTime ? Time.getTimeStr(record.createTime) : ''}
        </span>
      )
    },
    {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '10%',
      render: (text, record, index) => (
        <span>
          {record.finishTime ? Time.getTimeStr(record.finishTime) : ''}
        </span>
      )
    }
  ]
  remoteOrderColumns = [
    {
      title: '商户订单号',
      dataIndex: 'platformOrderNo',
      width: '20%'
    },
    {
      title: '交易平台',
      dataIndex: 'thirdType',
      width: '10%',
      render: (text, record) => (
        <span>
          {record.thirdType !== null ? ACCOUNTTYPE[record.thirdType] : ''}
        </span>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: '10%',
      render: (text, record) => (
        <span>
          {record.amount !== null ? (
            <span className="shalowRed">¥{record.amount}</span>
          ) : null}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      width: '10%',
      render: (text, record) => (
        <span>
          {record.status === REMOTE_ORDER_STATUS_SUCCESS ? '成功' : '未支付'}
        </span>
      )
    },
    {
      title: '账户',
      dataIndex: 'userAccount',
      width: '10%'
    },
    {
      title: '创建时间',
      dataIndex: 'oderCreateTime',
      width: '10%',
      render: (text, record, index) => (
        <span>
          {record.oderCreateTime ? Time.getTimeStr(record.oderCreateTime) : ''}
        </span>
      )
    },
    {
      title: '结束时间',
      dataIndex: 'orderFinishTime',
      width: '10%',
      render: (text, record, index) => (
        <span>
          {record.orderFinishTime
            ? Time.getTimeStr(record.orderFinishTime)
            : ''}
        </span>
      )
    }
  ]
  render() {
    const { detail } = this.props
    const { platformOrder, thirdOrder } = detail
    const localOrder = platformOrder ? [platformOrder] : []
    const remoteOrder = thirdOrder ? [thirdOrder] : []
    return (
      <div className="detailPanel-contentBlock">
        <h3 className="topSeperator">本地账单:</h3>
        <Table
          bordered
          pagination={false}
          dataSource={localOrder}
          loading={false}
          rowKey={record => record.orderNo}
          columns={this.localOrderColumns}
          style={{ marginTop: '20px' }}
        />
        <h3 className="topSeperator">第三方账单:</h3>
        <Table
          bordered
          pagination={false}
          dataSource={remoteOrder}
          loading={false}
          rowKey={record => record.platformOrderNo}
          columns={this.remoteOrderColumns}
          style={{ marginTop: '20px' }}
        />
      </div>
    )
  }
}
export default FundCheckDetailTables
