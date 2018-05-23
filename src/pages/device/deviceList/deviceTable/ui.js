import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import SearchLine from '../../../component/searchLine'
import DeviceSelector from '../../../component/deviceSelector'
import SchoolSelector from '../../../component/schoolSelector'
import CONSTANTS from '../../../../constants'

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
    const {
      page,
      schoolId,
      deviceType,
      dataSource,
      loading,
      total,
      schools
    } = this.props
    const { forbiddenStatus } = this.props
    const columns = [
      {
        title: '学校',
        dataIndex: 'schoolId',
        className: 'firstCol',
        render: (text, record, index) => {
          if (schools.length) {
            let sch = schools.find((r, i) => {
              return r.id === record.schoolId
            })
            return sch ? sch.name : ''
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
              {forbiddenStatus.DEVICE_DETILE ? null : (
                <span>
                  <Link to={addr}>详情</Link>
                </span>
              )}
            </div>
          )
        }
      }
    ]

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
            columns={columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

export default DevicesTable
