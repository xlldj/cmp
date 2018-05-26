import React, { Component } from 'react'
import { Table, Badge } from 'antd'
import detailTabHoc from './detailTabHoc'
import Time from '../../../../../util/time'
import CONSTANTS from '../../../../../constants'
import { connect } from 'react-redux'
import { fetchFundList } from '../../../../../actions'
const { TASK_DETAIL_LIST_LENGTH: SIZE } = CONSTANTS

class UserFundInfo extends Component {
  userFundColumns = [
    {
      title: '时间',
      dataIndex: 'createTime',
      width: '25%',
      render: (text, record) => Time.getTimeStr(record.createTime)
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      width: '25%',
      render: (text, record) => {
        if (record.instead) {
          return CONSTANTS.FUNDTYPE[record.operationType] + '(代充值)'
        } else {
          return CONSTANTS.FUNDTYPE[record.operationType]
        }
      }
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      width: '25%',
      render: (text, record, index) => {
        switch (record.status) {
          case 1:
            return (
              <Badge
                status="error"
                text={CONSTANTS.WITHDRAWSTATUS[record.status]}
              />
            )
          case 2:
          case 5:
          case 6:
            return (
              <Badge
                status="default"
                text={CONSTANTS.WITHDRAWSTATUS[record.status]}
              />
            )
          case 3:
            return (
              <Badge
                status="warning"
                text={CONSTANTS.WITHDRAWSTATUS[record.status]}
              />
            )
          case 4:
            return (
              <Badge
                status="success"
                text={CONSTANTS.WITHDRAWSTATUS[record.status]}
              />
            )
          default:
            return <Badge status="warning" text="未知" />
        }
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      className: 'shalowRed',
      render: text => `¥${text}`
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
        columns={this.userFundColumns}
      />
    )
  }
}
const fetchData = props => {
  const { creatorId } = props
  const body = {
    userId: creatorId,
    page: 1,
    size: SIZE
  }
  fetchFundList(body)
}

const mapStateToProps = (state, ownProps) => ({
  list: state.fundListModal.list,
  loading: state.fundListModal.loading
})
export default connect(mapStateToProps, null)(
  detailTabHoc(UserFundInfo, fetchData)
)
