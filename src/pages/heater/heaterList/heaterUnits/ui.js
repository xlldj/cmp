import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelector'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'

const {
  PAGINATION: SIZE,
  HEATER_LIST_PAGE_TABS,
  HEATER_LIST_TAB_REGISTERD,
  HEATER_UNIT_DEVICE_TYPE
} = CONSTANTS
const subModule = 'heaterList'

class HeaterUnitsUi extends React.Component {
  constructor(props) {
    super(props)
    this.columns = [
      {
        title: '机组名称',
        dataIndex: 'name',
        className: 'firstCol',
        text: this.heaterUnitName
      },
      {
        title: '设备名称',
        dataIndex: 'name',
        width: '20%'
      },
      {
        title: '设备类型',
        dataIndex: 'type',
        width: '20%',
        render: (text, record, index) =>
          record.type ? HEATER_UNIT_DEVICE_TYPE(record.lastLoginTime) : ''
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        width: '20%',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : ''
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <a href="" onClick={e => this.editUnit(e, record.id)}>
                编辑
              </a>
              <span className="ant-divider" />
              <a href="" onClick={e => this.deleteUnit(e, record.id)}>
                删除
              </a>
            </span>
          </div>
        )
      }
    ]
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeHeater(subModule, { page: 1, schoolId: value })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeHeater(subModule, { page: page })
  }
  changeTab = v => {
    let { tabIndex } = this.props
    if (tabIndex === v) {
      return
    }
    this.props.changeHeater(subModule, {
      tabIndex: v
    })
  }

  render() {
    const { page, schoolId, dataSource, loading, total, tabIndex } = this.props
    console.log(schoolId)
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    return (
      <div className="heaterTableWrapper">
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
            columns={
              tabIndex === 1 ? this.unregisterdColumns : this.registerdColumns
            }
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

export default HeaterUnitsUi
