import React from 'react'

import { Table, Modal, Button } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import AjaxHandler from '../../../../util/ajax'
// import AjaxHandler from '../../../../mock/ajax'
import Noti from '../../../../util/noti'
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
      total: '',
      machineUnits: []
    }
  }
  componentDidMount() {
    this.props.hide(false)
    let machineUnitId = parseInt(this.props.match.params.id.slice(1), 10)
    // 'machineUnitId' is from url query,
    // if it differs from props.machineUnitId, change the props.
    // else fetch the heaterUnit info, and then set schoolId and fetch heaterUnits
    console.log(machineUnitId, this.props.machineUnitId)
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
  fetchHeaterInfo(props) {
    let { machineUnitId } = props || this.props
    if (!machineUnitId) {
      return
    }
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
      /*
        ways to change schoolId:
          1. click through select
          2. componentDidMount changed id from reducer, then fetch the school of the machine, and the school is just not the corresponding one.
      */
      this.fetchHeaterOfSchool(nextProps)
    } else {
      if (!checkObject(nextProps, this.props, ['machineUnitId'])) {
        /*
          3 ways to change 'machineUnitId':
            1. click the option in select. the index below will always exist
            2. componentDidMount changed default id from reducer.
            3. select another school.
          2 and 3 need to fetch schoolId of the machineUnitId
        */

        let index = this.state.machineUnits.findIndex(
          u => u.id === parseInt(nextProps.machineUnitId, 10)
        )
        if (index !== -1) {
          this.setState({
            heaterUnitName: this.state.machineUnits[index].name
          })
        } else {
          this.fetchHeaterInfo(nextProps)
        }
      }
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
      if (json && json.data) {
        let { machineUnits } = json.data
        let nextState = { machineUnits }
        // if current machineUnitId is not in machineUnits, set first item as machineUnitId
        let exist = machineUnits.findIndex(
          m => m.id === this.props.machineUnitId
        )
        if (exist === -1) {
          this.props.changeHeater(subModule, {
            machineUnitId:
              (machineUnits && machineUnits[0] && machineUnits[0].id) || 0
          })
        } else {
          let name = machineUnits[exist].name
          this.setState({
            heaterUnitName: name || ''
          })
        }
        this.setState(nextState)
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
  deleteUnit = (e, id) => {
    e.preventDefault()
    let resource = '/api/machine/delete'
    const body = {
      id
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        Noti.hintOk('删除成功', '成功删除该设备')
        this.fetchDevicesOfUnit()
      }
    })
  }
  editUnit = (e, id) => {
    e.preventDefault()
    let data = this.state.dataSource.find(d => d.id === id)
    let { name, type } = data || {}
    this.setState({
      editingName: name || '',
      editingType: type || '',
      editingId: id,
      showEditingModal: true
    })
  }
  cancelEdit = () => {
    this.setState({
      editingName: '',
      editingType: '',
      editingId: 0,
      showEditingModal: false
    })
  }
  changeEditingType = v => {
    this.setState({
      editingType: v
    })
  }
  changeEditingName = e => {
    this.setState({
      editingName: e.target.value
    })
  }
  confirmEdit = () => {
    let { editingName, editingType, editingId } = this.state
    if (!editingName || !editingType) {
      return
    }
    let resource = '/api/machine/update'
    const body = {
      machineId: editingId,
      type: parseInt(editingType, 10),
      name: editingName.trim()
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        Noti.hintOk('编辑成功', '更改已提交给服务器')
        this.setState(
          {
            editingId: 0,
            editingName: '',
            editingType: '',
            showEditingModal: false
          },
          this.fetchDevicesOfUnit()
        )
      }
    })
  }
  render() {
    const {
      dataSource,
      loading,
      total,
      machineUnits,
      heaterUnitName,
      editingName,
      editingType,
      showEditingModal
    } = this.state
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

    const columns = [
      {
        title: '机组名称',
        dataIndex: 'nameUnit',
        className: 'firstCol',
        render: () => heaterUnitName
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
          record.type ? HEATER_UNIT_DEVICE_TYPE[record.type] : ''
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
            columns={columns}
            onChange={this.changePage}
          />
        </div>
        <Modal
          wrapClassName="modal"
          width={300}
          title="编辑"
          visible={showEditingModal}
          onCancel={this.cancelEdit}
          footer={null}
          header={null}
          okText=""
        >
          <ul className="form">
            <li>
              <label>类型</label>
              <BasicSelector
                staticOpts={HEATER_UNIT_DEVICE_TYPE}
                selectedOpt={editingType}
                changeOpt={this.changeEditingType}
              />
            </li>
            <li>
              <label>名称</label>
              <input value={editingName} onChange={this.changeEditingName} />
            </li>
          </ul>
          <Button
            className="centerBlock"
            type="primary"
            onClick={this.confirmEdit}
          >
            提交
          </Button>
        </Modal>
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
