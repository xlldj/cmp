import React from 'react'
import { Link } from 'react-router-dom'

import { Table } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelector'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'

const SIZE = CONSTANTS.PAGINATION
const {
  HEATER_LIST_PAGE_TABS,
  HEATER_LIST_TAB_REGISTERD,
  HEATER_LIST_TAB_UNREGISTERD,
  HEATER_CONFIG_NEED_DELIVERY,
  HEATER_CONFIG_DELIVERED,
  HEATER_CONFIG_DELIVERY_FAIL
} = CONSTANTS
const subModule = 'heaterList'

class HeaterTable extends React.Component {
  constructor(props) {
    super(props)
    this.unregisterdColumns = [
      {
        title: 'IMEI',
        dataIndex: 'imei',
        className: 'firstCol'
      },
      {
        title: '申请注册时间',
        dataIndex: 'createTime',
        width: '20%',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : ''
      },
      {
        title: '上次登录时间',
        dataIndex: 'lastLoginTime',
        width: '20%',
        render: (text, record, index) =>
          record.lastLoginTime ? Time.getTimeStr(record.lastLoginTime) : ''
      },
      {
        title: '累计登录次数',
        dataIndex: 'loginCount',
        width: '20%'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => {
          let addr = {
            pathname: `/heater/list/detail/:${record.id}`
          }
          return (
            <div className="editable-row-operations lastCol">
              <span>
                <Link to={addr}>立即注册</Link>
              </span>
            </div>
          )
        }
      }
    ]

    this.registerdColumns = [
      {
        title: '机组名称',
        dataIndex: 'name',
        className: 'firstCol',
        width: '11%'
      },
      {
        title: '所在学校',
        dataIndex: 'schoolName',
        width: '11%'
      },
      {
        title: '供水楼栋',
        dataIndex: 'buildingNames',
        width: '12%',
        render: (text, record, index) =>
          record.buildingNames ? record.buildingNames.join('、') : ''
      },
      {
        title: 'IMEI',
        dataIndex: 'imei',
        width: '12%'
      },
      {
        title: '设备个数',
        dataIndex: 'machineCount',
        width: '10%',
        render: (text, record) => (
          <span>
            {record.machineCount}
            <Link
              to={{
                pathname: `/heater/list/units/:${record.id}`
              }}
            >
              (查看详情)
            </Link>
          </span>
        )
      },
      {
        title: '电表倍率',
        dataIndex: 'electricMeterRate',
        width: '7%'
      },
      {
        title: '减排参数',
        dataIndex: 'emissionReductionParam',
        width: '7%'
      },
      {
        title: '创建时间',
        dataIndex: 'registerTime',
        width: '12%',
        render: (text, record) =>
          record.registerTime ? Time.getTimeStr(record.registerTime) : ''
      },
      {
        title: '配置下发',
        dataIndex: 'configStatus',
        width: '12%',
        render: (text, record) => {
          let statusItem
          switch (record.configStatus) {
            case HEATER_CONFIG_NEED_DELIVERY:
              statusItem = (
                <a href="" onClick={e => this.executeConfig(e, record.id)}>
                  立即下发
                </a>
              )
              break
            case HEATER_CONFIG_DELIVERY_FAIL:
              statusItem = (
                <span>
                  下发失败<a
                    href=""
                    onClick={e => this.executeConfig(e, record.id)}
                  >
                    重新下发
                  </a>
                </span>
              )
              break
            case HEATER_CONFIG_DELIVERED:
              statusItem = <span>下发成功</span>
              break
            default:
              return '未知'
          }
          return statusItem
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => {
          let addr = {
            pathname: `/heater/list/detail/:${record.id}`
          }
          return (
            <div className="editable-row-operations lastCol">
              <span>
                <Link to={addr}>编辑</Link>
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
              tabIndex === HEATER_LIST_TAB_UNREGISTERD
                ? this.unregisterdColumns
                : this.registerdColumns
            }
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

export default HeaterTable
