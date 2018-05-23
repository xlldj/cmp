import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Popconfirm } from 'antd'

import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../../constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
import SchoolSelector from '../../component/schoolSelector'
import { checkObject } from '../../../util/checkSame'
const subModule = 'rateLimit'

const SIZE = CONSTANTS.PAGINATION

class RateLimitTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0
    }
    const { forbiddenStatus } = this.props
    const { ADD_RATELIMITE } = forbiddenStatus
    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        className: 'firstCol',
        width: '25%'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '25%',
        render: (text, record) => CONSTANTS.DEVICETYPE[record.deviceType]
      },
      {
        title: '扣费速率',
        dataIndex: 'money',
        render: (text, record, index) => `${record.time}秒/${record.money}元`
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '25%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              {ADD_RATELIMITE ? null : (
                <span>
                  <Link to={`/device/rateLimit/editRateLimit/:${record.id}`}>
                    编辑
                  </Link>
                  <span className="ant-divider" />
                  <Popconfirm
                    title="确定要删除么?"
                    onConfirm={e => {
                      this.delete(e, record.id)
                    }}
                    onCancel={this.cancelDelete}
                    okText="确认"
                    cancelText="取消"
                  >
                    <a href="">删除</a>
                  </Popconfirm>
                </span>
              )}
            </span>
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/order/limit/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data) {
          nextState.dataSource = json.data.orderLimits
          nextState.total = json.data.total
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
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
  componentWillUnmount() {
    this.props.hide(true)
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
    this.props.changeDevice(subModule, { page: 1, schoolId: value })
  }
  delete = (e, id) => {
    e.preventDefault()
    let resource = '/order/limit/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintLock('当前项不能被删除', '请咨询相关人员！')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  cancelDelete = () => {
    // nothing
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }

  render() {
    let { loading, total } = this.state
    let { page, schoolId, forbiddenStatus } = this.props
    const { ADD_RATELIMITE } = forbiddenStatus
    return (
      <div className="contentArea">
        <SearchLine
          addTitle={ADD_RATELIMITE ? null : '添加扣费速率'}
          addLink={ADD_RATELIMITE ? null : '/device/rateLimit/addRateLimit'}
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
            onChange={this.changePage}
            dataSource={this.state.dataSource}
            columns={this.columns}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.deviceModule[subModule].schoolId,
  page: state.deviceModule[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(RateLimitTable)
)
