import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Popconfirm } from 'antd'

import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'
import CONSTANTS from '../../../constants'
import Format from '../../../util/format'
import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'timeset'

const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class TimesetTable extends React.Component {
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
    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName',
        width: '15%',
        className: 'firstCol'
      },
      {
        title: '设备',
        dataIndex: 'deviceType',
        width: '15%',
        render: (text, record) => (
          <p>{CONSTANTS.DEVICETYPE[record.deviceType]}</p>
        )
      },
      {
        title: '供水时段',
        dataIndex: 'items',
        render: (text, record, index) => {
          let items = record.items
          let timeItem = items.map((r, i) => (
            <span key={i} className="mg10">
              {r.startTime.hour}:{r.startTime.minute}~{r.endTime.hour}:{
                r.endTime.minute
              }
            </span>
          ))
          return timeItem
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '10%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/timeset/editTimeset/:${record.id}`}>编辑</Link>
              <span className="ant-divider" />
              <Popconfirm
                title="确定要删除此么?"
                onConfirm={e => {
                  this.delete(e, record.id)
                }}
                okText="确认"
                cancelText="取消"
              >
                <a href="">删除</a>
              </Popconfirm>
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
    let resource = '/api/time/range/water/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const data = json.data.waterTimeRanges.map((s, i) => {
            s.key = s.id
            s.items.forEach((record, index) => {
              record.startTime.minute = Format.minuteFormat(
                record.startTime.minute
              )
              record.endTime.minute = Format.minuteFormat(record.endTime.minute)
            })
            return s
          })
          nextState.dataSource = data
          nextState.total = json.data.total
        } else {
          this.setState(nextState)
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
  delete = (e, id) => {
    e.preventDefault()
    let resource = '/api/time/range/water/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintError('当前项不能被删除', '请咨询相关人员！')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice(subModule, { page: 1, schoolId: value })
  }
  render() {
    let { loading, total } = this.state
    let { page, schoolId } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          addTitle="添加供水时段"
          addLink="/device/timeset/addTimeset"
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

// export default TimesetTable

const mapStateToProps = (state, ownProps) => ({
  page: state.deviceModule[subModule].page,
  schoolId: state.deviceModule[subModule].schoolId
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(TimesetTable)
)
