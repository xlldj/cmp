import React from 'react'
import { Table } from 'antd'

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

const {
  PAGINATION: SIZE,
  LOSTTYPE,
  LOST_HIDDEN_STATUS,
  LOST_SHOW_STATUS
} = CONSTANTS

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
    let { dataSource, forbiddenStatus } = this.props
    let selectedDetailId = dataSource[index].id
    if (!forbiddenStatus.LOST_DETAIL) {
      this.props.changeLost(subModule, {
        selectedRowIndex: index,
        showDetail: true,
        selectedDetailId
      })
    }
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
        dataIndex: 'type',
        render: (text, record) => (
          <span className="">
            {LOSTTYPE[record.type] ? LOSTTYPE[record.type] : '----'}
          </span>
        )
      },
      {
        title: '标题',
        dataIndex: 'title',
        width: '20%',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '用户',
        dataIndex: 'user',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '发布时间',
        dataIndex: 'createTime',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: '评论数量',
        dataIndex: 'commentsCount',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '被用户查看数量',
        dataIndex: 'viewCount',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '举报次数',
        dataIndex: 'reportCount',
        render: (text, record) => <span className="">{text}</span>
      },
      {
        title: '显示状态',
        dataIndex: 'status',
        render: (text, record) => (
          <span className="">
            {LOST_SHOW_STATUS[record.status]
              ? LOST_SHOW_STATUS[record.status]
              : '----'}
            {parseInt(record.status, 10) === LOST_HIDDEN_STATUS ? (
              <span>
                ({record.hiddenByUserName ? record.hiddenByUserName : '--/'}
                {record.hiddenTime ? Time.getTimeStr(record.hiddenTime) : '--'})
              </span>
            ) : null}
          </span>
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
