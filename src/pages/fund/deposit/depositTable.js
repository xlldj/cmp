import React from 'react'
import { Table, Badge, Popconfirm, notification } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'

import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'deposit'

const typeName = {
  1: '充值优惠',
  2: '赠送红包'
}
const STATUS = {
  3: '是',
  2: '否',
  1: '已过期'
}
const HINTSTATUS = {
  3: 'success',
  2: 'default',
  1: 'error'
}
const SIZE = CONSTANTS.PAGINATION

class DepositTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = [],
      schools = []
    this.state = {
      dataSource,
      schools,
      loading: false,
      total: 0
    }
    const { forbiddenStatus } = this.props
    this.columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        width: '21%',
        className: 'firstCol'
      },
      {
        title: <p>活动名称</p>,
        dataIndex: 'name',
        width: '12%'
      },
      {
        title: <p>活动类型</p>,
        dataIndex: 'type',
        width: '12%',
        render: text => typeName[text]
      },
      {
        title: <p>活动创建日期</p>,
        dataIndex: 'updateTime',
        width: '15%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.updateTime)
        }
      },
      {
        title: <p>活动截止日期</p>,
        dataIndex: 'endTime',
        width: '15%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.endTime)
        }
      },
      {
        title: <p>上线状态</p>,
        dataIndex: 'online',
        width: '10%',
        render: (text, record, index) => (
          <Badge
            status={HINTSTATUS[record.online]}
            text={STATUS[record.online]}
          />
        )
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            {forbiddenStatus.FUND_WITHDRAW_ACT_ADD_AND_EDIT ? null : (
              <Link to={`/fund/deposit/depositInfo/:${record.id}`}>编辑</Link>
            )}
            {forbiddenStatus.FUND_WITHDRAW_ACT_ADD_AND_EDIT ||
            forbiddenStatus.FUND_WITHDRAW_ACT_DELETE ? null : (
              <span className="ant-divider" />
            )}
            {forbiddenStatus.FUND_WITHDRAW_ACT_DELETE ? null : (
              <Popconfirm
                title="确定要删除此任务么?"
                onConfirm={e => {
                  this.delete(e, record.id)
                }}
                onCancel={this.cancelDelete}
                okText="确认"
                cancelText="取消"
              >
                <a href="">删除</a>
              </Popconfirm>
            )}
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/deposit/activity/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.depositActivities
          nextState.total = json.data.total
        } else {
          this.setState(nextState)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }
  componentDidMount() {
    let { page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    let { page, schoolId } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeFund(subModule, { page: 1, schoolId: value })
  }

  delete = (e, id) => {
    e.preventDefault()
    let url = '/api/deposit/activity/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          this.openNotificationWithIcon('error')
        }
      }
    }
    AjaxHandler.ajax(url, body, cb)
  }
  cancelDelete = () => {}
  openNotificationWithIcon = type => {
    notification['error']({
      message: '当前活动不能被删除',
      description: '请进入编辑页面将该活动下线再删除！',
      duration: 4
    })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeFund(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page, schoolId, forbiddenStatus } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          addTitle={
            forbiddenStatus.FUND_WITHDRAW_ACT_ADD_AND_EDIT
              ? null
              : '创建充值活动'
          }
          addLink={
            forbiddenStatus.FUND_WITHDRAW_ACT_ADD_AND_EDIT
              ? null
              : '/fund/deposit/addDeposit'
          }
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.fundModule[subModule].schoolId,
  page: state.fundModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeFund
  })(DepositTable)
)
