import React from 'react'
import { Link } from 'react-router-dom'
import tableHoc from '../../../public/tableHoc'

import { Table } from 'antd'
import AjaxHandler from '../../../util/ajax'

import SearchLine from '../../component/searchLine'
import DeviceSelector from '../../component/deviceSelector'
import SchoolSelector from '../../component/schoolSelector'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'

const typeName = CONSTANTS.DEVICETYPE
const SIZE = CONSTANTS.PAGINATION

class DevicesTable extends React.Component {
  constructor(props) {
    super(props)
    let searchingText = '',
      searchText = '',
      reset = false
    this.state = {
      s: '',
      searchingText,
      searchText,
      reset
    }
    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolId',
        className: 'firstCol',
        render: (text, record, index) => {
          if (this.props.schools.length) {
            let sch = this.props.schools.find((r, i) => {
              return r.id === record.schoolId
            })
            return sch.name
          } else {
            return ''
          }
        }
      },
      {
        title: '设备位置',
        dataIndex: 'location',
        width: '25%',
        render: (text, record) => (text ? text : '暂无')
      },
      {
        title: '设备类型',
        dataIndex: 'type',
        width: '25%',
        render: (text, record, index) => typeName[record.type]
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '25%',
        render: (text, record, index) => {
          let addr = {
            pathname: `/device/list/deviceInfo/:${record.id}`,
            state: {
              id: record.id,
              deviceType: record.type,
              residenceId: record.residenceId
            }
          }
          return (
            <div className="editable-row-operations lastCol">
              <span>
                <Link to={addr}>详情</Link>
              </span>
            </div>
          )
        }
      }
    ]
  }

  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice('deviceList', { page: 1, schoolId: value })
  }
  changeDevice = value => {
    let { deviceType } = this.props
    if (deviceType === value) {
      return
    }
    this.props.changeDevice('deviceList', { page: 1, deviceType: value })
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let { selectKey } = this.props
    let { searchingText } = this.state
    if (selectKey === searchingText) {
      return
    }
    this.props.changeDevice('deviceList', { page: 1, selectKey: searchingText })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice('deviceList', { page: page })
  }

  render() {
    const { searchingText } = this.state
    const { page, schoolId, deviceType, data } = this.props
    const { dataSource, loading, total } = data

    return (
      <div className="contentArea">
        <SearchLine
          searchInputText="设备位置"
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
          searchingText={searchingText}
          pressEnter={this.pressEnter}
          changeSearch={this.changeSearch}
        />

        <div className="tableList">
          <Table
            loading={loading}
            bordered
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

const fetchData = (body, thisObj) => {
  const that = thisObj
  that.setState({
    loading: true
  })
  let resource = '/api/device/query/list'
  const cb = json => {
    const nextState = {
      loading: false
    }
    nextState.dataSource = json.data.devices
    nextState.total = json.data.total
    that.setState(nextState)
  }
  AjaxHandler.ajax(resource, body, cb, null, {
    thisObj: thisObj,
    clearLoading: true
  })
}
// export default DevicesTable
const fetchDeviceList = (newProps, oldProps, thisObj) => {
  if (
    checkObject(newProps, oldProps, [
      'page',
      'schoolId',
      'deviceType',
      'selectKey'
    ])
  ) {
    return
  }
  let { page, schoolId, deviceType, selectKey } = newProps
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
  if (selectKey) {
    body.selectKey = selectKey
  }
  fetchData(body, thisObj)
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeDevice.deviceList.schoolId,
  deviceType: state.changeDevice.deviceList.deviceType,
  selectKey: state.changeDevice.deviceList.selectKey,
  page: state.changeDevice.deviceList.page,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(tableHoc(DevicesTable, fetchDeviceList))
)
