import React from 'react'
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
      width: '20%'
    },
    {
      title: '用户',
      dataIndex: 'userPhone',
      width: '10%'
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      width: '10%',
      render: (text, record) => FUNDTYPE[record.orderType]
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: '10%',
      render: (text, record) =>
        record.amount !== undefined ? (
          <span className="shalowRed">¥{record.amount}</span>
        ) : null
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      width: '10%',
      render: (text, record) => WITHDRAWSTATUS[record.orderStatus] || '未知'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '10%',
      render: (text, record, index) => {
        return record.createTime ? Time.getTimeStr(record.createTime) : ''
      }
    },
    {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '10%',
      render: (text, record, index) => {
        return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
      }
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
      render: (text, record) => ACCOUNTTYPE[record.thirdType]
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: '10%',
      render: (text, record) =>
        record.amount !== undefined ? (
          <span className="shalowRed">¥{record.amount}</span>
        ) : null
    },
    {
      title: '状态',
      dataIndex: 'orderStatus',
      width: '10%',
      render: (text, record) =>
        record.status === REMOTE_ORDER_STATUS_SUCCESS ? '成功' : '未支付'
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
      render: (text, record, index) => {
        return record.oderCreateTime
          ? Time.getTimeStr(record.oderCreateTime)
          : ''
      }
    },
    {
      title: '结束时间',
      dataIndex: 'orderFinishTime',
      width: '10%',
      render: (text, record, index) => {
        return record.orderFinishTime
          ? Time.getTimeStr(record.orderFinishTime)
          : ''
      }
    }
  ]
  render() {
    const { detail } = this.props
    const { platformOrder = {}, thirdOrder = {} } = detail
    const localOrder = [platformOrder]
    const remoteOrder = [thirdOrder]
    return (
      <div className="detailPanel-contentBlock">
        <Table
          bordered
          pagination={false}
          dataSource={localOrder}
          loading={false}
          rowKey={record => record.orderNo}
          columns={this.localOrderColumns}
          style={{ marginTop: '20px' }}
        />
        <Table
          bordered
          pagination={false}
          dataSource={remoteOrder}
          loading={false}
          rowKey={record => record.orderNo}
          columns={this.remoteOrderColumns}
          style={{ marginTop: '20px' }}
        />
      </div>
    )
  }
}
export default FundCheckDetailTables
