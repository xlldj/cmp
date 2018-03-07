import React from 'react'

import { Table } from 'antd'

import PhaseLine from '../../../component/phaseLine'
import SchoolSelector from '../../../component/schoolSelector'
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
    let { schoolId } = this.props.location.state
    let machineUnitId = parseInt(this.props.match.params.id.slice(1), 10)
    this.props.changeHeater(subModule, {
      schoolId: schoolId ? parseInt(schoolId, 10) : 0,
      machineUnitId: machineUnitId
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
      const body = {
        page: 1,
        size: SIZE,
        status: HEATER_STATUS_REGISTERD,
        schoolId: nextProps.schoolId
      }
      this.fetchHeaterOfSchool(body)
    } else {
      this.fetchData(nextProps)
    }
  }
  fetchHeaterOfSchool = body => {
    let resource = '/machine/unit/list'
    AjaxHandler.fetch(resource, body).then(json => {
      // set result as options of machine unit select
      this.setState({
        machineUnits: json.data.machineUnits
      })
    })
  }
  fetchData = props => {
    let { schoolId, page, machineUnitId } = props
    const body = {
      size: SIZE,
      machineUnitId,
      schoolId,
      page
    }
    const resource = '/machine/list'
    AjaxHandler.fetch(resource, body, null, {
      clearLoading: true,
      thisObj: this
    }).then(json => {
      // set results as dataSource
      console.log(json)
      this.setState({
        dataSource: json.data.machines,
        total: json.data.total
      })
    })
  }
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeHeater(subModule, {
      page: 1,
      schoolId: value
    })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeHeater(subModule, { page: page })
  }
  render() {
    const { dataSource, loading, total } = this.state
    const { page, schoolId } = this.props
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    return (
      <div className="heaterUnitsWrapper">
        <PhaseLine selectors={[selector1]} noBorder={true} />

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
