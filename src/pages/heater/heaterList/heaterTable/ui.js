import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelector'
import CONSTANTS from '../../../../constants'

const typeName = CONSTANTS.DEVICETYPE
const SIZE = CONSTANTS.PAGINATION
const { HEATER_LIST_PAGE_TABS, HEATER_LIST_TAB_REGISTERD } = CONSTANTS

class HeaterTable extends React.Component {
  constructor(props) {
    super(props)
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
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeDevice('deviceList', { page: 1, schoolId: value })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice('deviceList', { page: page })
  }
  changeTab = v => {}

  render() {
    const { page, schoolId, dataSource, loading, total, tabIndex } = this.props
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    return (
      <div className="contentArea">
        <PhaseLine
          value={tabIndex}
          staticPhase={HEATER_LIST_PAGE_TABS}
          selectors={tabIndex === HEATER_LIST_TAB_REGISTERD ? [selector1] : []}
          changePhase={this.changeTab}
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

export default HeaterTable
