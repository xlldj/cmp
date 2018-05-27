import React from 'react'
import { Table, Badge } from 'antd'
import EnableCommentEdit from './enableCommentEdit'
import Time from '../../../../util/time'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeLost,
  fetchEnableCommentList,
  updateCommentSwitch
} from '../../action'
import CONSTANTS from '../../../../constants'
import { checkObject } from '../../../../util/checkSame'
import { lostFoundListPropsController } from '../controller'
const moduleName = 'lostModule'
const subModule = 'enableComment'
const modalName = 'enableCommentModal'
const { PAGINATION: SIZE } = CONSTANTS

class EnableComment extends React.Component {
  columns = [
    {
      title: '学校名称',
      dataIndex: 'schoolName',
      className: 'firstCol'
    },
    {
      title: '是否上线评论功能',
      dataIndex: 'status',
      render: (text, record) =>
        record.status === true ? (
          <Badge status="success" text="是" />
        ) : (
          <Badge status="error" text="否" />
        )
    },
    {
      title: '操作人',
      dataIndex: 'operUserName',
      width: '20%'
    },
    {
      title: '更新日期',
      dataIndex: 'updateTime',
      render: (text, record) =>
        record.updateTime ? Time.getTimeStr(record.updateTime) : ''
    },
    {
      title: <p className="lastCol">操作</p>,
      dataIndex: 'operation',
      width: '12%',
      render: (text, record, index) => (
        <div className="editable-row-operations lastCol">
          <span>
            <a onClick={e => this.edit(e, record.id)}>编辑</a>
          </span>
        </div>
      )
    }
  ]
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  sendFetch(props) {
    props = props || this.props
    const { page } = props
    const body = {
      page: page,
      size: SIZE
    }
    props.fetchEnableCommentList(body)
  }
  edit = (e, id) => {
    e.preventDefault()
    this.props.changeLost(subModule, {
      showEnableCommentModal: true,
      selectedDetailId: id
    })
  }
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
  closeModal = () => {
    this.props.changeLost(subModule, { showEnableCommentModal: false })
  }
  confirmPost = body => {
    this.props.updateCommentSwitch(body, this.props)
  }
  render() {
    const {
      dataSource,
      total,
      loading,
      page,
      showEnableCommentModal
    } = this.props
    return (
      <div className="tableList" style={{ marginTop: '20px' }}>
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
          columns={this.columns}
          onChange={this.changePage}
        />
        {showEnableCommentModal ? (
          <EnableCommentEdit
            closeModal={this.closeModal}
            confirm={this.confirmPost}
            {...this.props}
          />
        ) : null}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    page: state[moduleName][subModule].page,
    total: state[modalName].total,
    dataSource: state[modalName].list,
    loading: state[modalName].listLoading,
    showEnableCommentModal: state[moduleName][subModule].showEnableCommentModal,
    selectedDetailId: state[moduleName][subModule].selectedDetailId
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeLost,
    fetchEnableCommentList,
    updateCommentSwitch
  })(EnableComment)
)
