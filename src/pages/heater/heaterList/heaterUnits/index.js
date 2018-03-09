import React from 'react'

import { Table } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import AjaxHandler from '../../../../util/ajax'
// import AjaxHandler from '../../../../mock/ajax'
import { checkObject } from '../../../../util/checkSame'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater } from '../../../../actions'

const {
  PAGINATION: SIZE,
  HEATER_UNIT_DEVICE_TYPE,
  HEATER_STATUS_REGISTERD
} = CONSTANTS
const subModule = 'heaterUnits'

class HeaterUnits extends React.PureComponent {
  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      dataSource: [],
      loading: false,
      total: ''
    }
    this.columns = [
      {
        title: '机组名称',
        dataIndex: 'nameUnit',
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
  componentDidMount() {
    this.props.hide(false)
    let machineUnitId = parseInt(this.props.match.params.id.slice(1), 10)
    // 'machineUnitId' is from url query,
    // if it differs from props.machineUnitId, change the props.
    // else fetch the heaterUnit info, and then set schoolId and fetch heaterUnits
    if (machineUnitId !== this.props.machineUnitId) {
      this.props.changeHeater(subModule, {
        machineUnitId: machineUnitId
      })
      this.fetchHeaterOfSchool()
    } else {
      this.fetchDevicesOfUnit()
      this.fetchHeaterInfo()
    }
  }
  fetchHeaterInfo() {
    let { machineUnitId } = this.props
    let resource = '/machine/unit/one'
    const body = {
      id: machineUnitId
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        this.props.changeHeater(subModule, {
          schoolId: json.data.schoolId
        })
      }
    })
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  componentWillReceiveProps(nextProps) {
    if (
      checkObject(nextProps, this.props, ['page', 'schoolId', 'machineUnitId'])
    ) {
      return
    }
    if (!checkObject(nextProps, this.props, ['schoolId'])) {
      // If 'schoolId' changed, refetch heater units agian. Always set page to 1.
      this.fetchHeaterOfSchool(nextProps)
    } else {
      this.fetchDevicesOfUnit(nextProps)
    }
  }
  fetchHeaterOfSchool = props => {
    // fetch all heater units of the school
    let { schoolId } = props || this.props
    let resource = '/machine/unit/list'
    const body = {
      page: 1,
      size: 10000,
      status: HEATER_STATUS_REGISTERD
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    AjaxHandler.fetch(resource, body).then(json => {
      // set result as options of machine unit select
      if (json.data) {
        let { machineUnits } = json.data
        this.setState({
          machineUnits
        })
        // if current machineUnitId is not in machineUnits, set first item as machineUnitId
        let exist = machineUnits.findIndex(
          m => m.id === this.props.machineUnitId
        )
        if (exist === -1) {
          this.props.changeHeater(subModule, {
            machineUnitId:
              (machineUnits && machineUnits[0] && machineUnits[0].id) || 0
          })
        }
      }
    })
  }
  fetchDevicesOfUnit = props => {
    let { schoolId, page, machineUnitId } = props || this.props
    const body = {
      size: SIZE,
      machineUnitId,
      schoolId: parseInt(schoolId, 10),
      page
    }
    const resource = '/machine/list'
    AjaxHandler.fetch(resource, body, null, {
      clearLoading: true,
      thisObj: this
    }).then(json => {
      // set results as dataSource
      console.log(json)
      if (json && json.data) {
        this.setState({
          dataSource: json.data.machines,
          total: json.data.total,
          loading: false
        })
      }
    })
  }
  changeSchool = value => {
    let { schoolId } = this.props
    let v = parseInt(value, 10)
    if (schoolId === v) {
      return
    }
    console.log('schoolId is changed: ', schoolId)
    this.props.changeHeater(subModule, {
      page: 1,
      schoolId: v
    })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeHeater(subModule, { page: page })
  }
  changeHeaterUnit = v => {
    this.props.changeHeater(subModule, {
      machineUnitId: parseInt(v, 10)
    })
  }
  render() {
    const { dataSource, loading, total, machineUnits } = this.state
    const { page, schoolId, machineUnitId } = this.props
    console.log(schoolId)
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const unitsOpts = {}
    machineUnits && machineUnits.forEach(m => (unitsOpts[m.id] = m.name))
    const unitsSelector = (
      <BasicSelector
        key="unitsSelector"
        className="select-item"
        selectedOpt={machineUnitId}
        staticOpts={unitsOpts}
        notFoundTitle="无"
        changeOpt={this.changeHeaterUnit}
      />
    )
    return (
      <div className="heaterUnitsWrapper">
        <PhaseLine selectors={[selector1, unitsSelector]} noBorder={true} />

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
const mapStateToProps = state => ({
  schoolId: state.heaterModule[subModule].schoolId,
  page: state.heaterModule[subModule].page,
  machineUnitId: state.heaterModule[subModule].machineUnitId
})
export default withRouter(
  connect(mapStateToProps, {
    changeHeater
  })(HeaterUnits)
)
