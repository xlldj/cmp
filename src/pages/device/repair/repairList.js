import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Badge, Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelector from '../../component/basicSelector'
import DeviceSelector from '../../component/deviceSelector'
import Time from '../../../util/time'
import CONSTANTS from '../../component/constants'
import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'repair'
const {
  TASK_TYPE_REPAIR,
  REPAIRSTATUS2TRUESTATUS,
  TASK_PENDING,
  TASK_ACCEPTED,
  TASK_ASSIGNED,
  TASK_FINISHED,
  TASK_REFUSED
} = CONSTANTS

const SIZE = CONSTANTS.PAGINATION

const typeName = CONSTANTS.DEVICETYPE

const STATUS = CONSTANTS.REPAIRSTATUS
// const STATUSFORSHOW = CONSTANTS.REPAIRSTATUSFORSHOW
const BACKTITLE = {
  fromUser: '返回用户详情',
  fromDevice: '返回设备详情',
  fromTask: '返回工单'
}

class RepairList extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = [],
      schools = [],
      total = 0,
      loading = false
    this.state = {
      dataSource,
      schools,
      total,
      loading
    }

    this.columns = [
      {
        title: <p className="firstCol">学校名称</p>,
        dataIndex: 'schoolName',
        width: '19%'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '9%',
        render: (text, record, index) => typeName[record.deviceType]
      },
      {
        title: '设备位置',
        dataIndex: 'location',
        width: '15%'
      },
      {
        title: '用户申请时间和已等待时间',
        dataIndex: 'hardwareNo',
        width: '24%',
        render: (text, record, index) => {
          let applyTS = Time.getTimeStr(record.createTime)
          let stopT =
            record.status === '7'
              ? new Date(record.finishTime)
              : record.status === '5' ? new Date(record.censorTime) : undefined

          let waitTime = stopT
            ? Time.getTimeInterval(record.createTime, stopT.getTime())
            : Time.getSpan(record.createTime)
          let waitTimeStr = stopT ? `总用时${waitTime}` : `已等待${waitTime}`
          return applyTS + ' (' + waitTimeStr + ')'
        }
      },
      {
        title: '维修状态',
        dataIndex: 'status',
        width: '12%',
        render: (text, record, index) => {
          switch (record.status) {
            case TASK_FINISHED:
              return <Badge status="success" text="维修完成" />
            case TASK_PENDING:
              return <Badge status="warning" text="待处理" />
            case TASK_ASSIGNED:
            case TASK_ACCEPTED:
            case TASK_REFUSED:
              return <Badge status="error" text={'处理中'} />
            default:
              return '已取消'
          }
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '7%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/repair/repairInfo/:${record.id}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }

  fetchSchools = () => {
    let resource = '/api/school/list'
    const body = {
      page: 1,
      size: 100
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.setState({
            schools: json.data.schools
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  fetchData = body => {
    this.setState({
      loading: true
    })
    /*------------change the resource api here-------------*/
    let resource = '/api/work/order/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.workOrders
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
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
    this.props.hide(false)
    let { page, schoolId, deviceType, status } = this.props
    const body = {
      page: page,
      size: SIZE,
      all: true,
      type: TASK_TYPE_REPAIR
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (deviceType !== 'all') {
      body.deviceType = deviceType
    }
    if (status !== 'all') {
      let statusArray = []
      statusArray.concat(REPAIRSTATUS2TRUESTATUS[parseInt(status, 10)])
      body.status = statusArray
    }

    let { state } = this.props.history.location
    if (state) {
      // this.props.changeOrder('order', {schoolId: 'all'})
      if (state.path === 'fromTask') {
        if (state.userId) {
          body.creatorId = state.userId
        } else if (state.deviceType) {
          body.residenceId = state.residenceId
          body.deviceType = state.deviceType
        }
      }
    }
    // this.fetchSchools()
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'page',
        'schoolId',
        'deviceType',
        'status'
      ])
    ) {
      return
    }
    let { page, schoolId, deviceType, status } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (deviceType !== 'all') {
      body.type = deviceType
    }
    if (status !== 'all') {
      let statusArray = []
      statusArray.concat(REPAIRSTATUS2TRUESTATUS[parseInt(status, 10)])
      body.status = statusArray
    }
    let { state } = this.props.history.location
    if (state) {
      // this.props.changeOrder('order', {schoolId: 'all'})
      if (state.path === 'fromTask') {
        if (state.userId) {
          body.creatorId = state.userId
        } else if (state.deviceType) {
          body.residenceId = state.residenceId
          body.deviceType = state.deviceType
        }
      }
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
  changeDevice = value => {
    let { deviceType } = this.props
    if (deviceType === value) {
      return
    }
    this.props.changeDevice(subModule, { page: 1, deviceType: value })
  }
  changeStatus = value => {
    let { status } = this.props
    if (status === value) {
      return
    }
    this.props.changeDevice(subModule, { page: 1, status: value })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }
  back = () => {
    this.props.history.goBack()
  }
  render() {
    const { dataSource, loading, total } = this.state
    const { schoolId, deviceType, status, page } = this.props
    const { state } = this.props.location
    return (
      <div className="contentArea">
        <div className="navLink">
          <Link to="/device/repair/repairProblem">
            <Button type="primary">常见问题设置</Button>
          </Link>
          <Link to="/device/repair/repairRate">
            <Button type="primary">评价列表</Button>
          </Link>
        </div>
        <SearchLine
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          selector2={
            <DeviceSelector
              selectedDevice={deviceType}
              changeDevice={this.changeDevice}
            />
          }
          selector3={
            <BasicSelector
              allTitle="全部状态"
              staticOpts={STATUS}
              selectedOpt={status}
              changeOpt={this.changeStatus}
            />
          }
        />
        <div className="tableList repairList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, total: total, current: page }}
            onChange={this.changePage}
            dataSource={dataSource}
            columns={this.columns}
          />
        </div>
        {state ? (
          <div className="btnRight">
            <Button onClick={this.back}>{BACKTITLE[state.path]}</Button>
          </div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeDevice[subModule].schoolId,
  deviceType: state.changeDevice[subModule].deviceType,
  status: state.changeDevice[subModule].status,
  page: state.changeDevice[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(RepairList)
)
