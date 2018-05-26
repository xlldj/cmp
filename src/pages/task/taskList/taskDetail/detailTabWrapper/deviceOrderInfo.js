import React, { Component } from 'react'
import { Table, Badge } from 'antd'
import detailTabHoc from './detailTabHoc'
import Time from '../../../../../util/time'
import CONSTANTS from '../../../../../constants'
import { connect } from 'react-redux'
import { fetchOrderList } from '../../../../../actions'
const { TASK_DETAIL_LIST_LENGTH: SIZE } = CONSTANTS

class DeviceOrderWrapper extends Component {
  deviceOrderColumns = [
    {
      title: '用户',
      dataIndex: 'username',
      width: '15%'
    },
    {
      title: '手机型号',
      dataIndex: 'mobileModel',
      width: '15%'
    },
    {
      title: '开始时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text, record, index) => {
        return Time.getTimeStr(record.createTime)
      }
    },
    {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '21%',
      render: (text, record, index) => {
        return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
      }
    },
    {
      title: '使用状态',
      dataIndex: 'status',
      render: (text, record, index) => {
        switch (record.status) {
          case 1:
            return <Badge status="warning" text="使用中" />
          case 2:
            return <Badge status="success" text="使用结束" />
          case 4:
            return <Badge status="default" text="已退单" />
          case 3:
            return <Badge status="warning" text="异常" />
          default:
            return <Badge status="warning" text="异常" />
        }
      }
    },
    {
      title: '消费金额',
      dataIndex: 'paymentType',
      width: '12%',
      className: 'shalowRed',
      render: (text, record, index) => {
        if (record.status !== 1) {
          return `${record.consume}` || '暂无'
        } else if (record.prepay) {
          return `${record.prepay}`
        }
      }
    }
  ]
  render() {
    const { list, loading } = this.props
    return (
      <Table
        bordered
        loading={loading}
        rowKey={record => record.id}
        pagination={false}
        dataSource={list}
        columns={this.deviceOrderColumns}
      />
    )
  }
}
const fetchData = props => {
  const { creatorId, residenceId, deviceType } = props
  const body = {
    userId: creatorId,
    page: 1,
    size: SIZE,
    residenceId: residenceId,
    deviceType: deviceType
  }
  fetchOrderList(body)
}

const mapStateToProps = (state, ownProps) => ({
  list: state.orderListModal.list,
  loading: state.orderListModal.loading
})
export default connect(mapStateToProps, null)(
  detailTabHoc(DeviceOrderWrapper, fetchData)
)
