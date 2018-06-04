import React from 'react'
import { Button, Radio, Modal, Cascader } from 'antd'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import DeviceSelector from '../../component/deviceWithoutAll'
import CONSTANTS from '../../../constants'
import AjaxHandler from '../../../util/ajax'
import { taskService } from '../../service/index'
import InsertMsgContainer from '../quickMsg/insertMsg/index'
import Noti from '../../../util/noti'
import { changeTask, fetchTaskDetail } from '../../../actions/index'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
// import { locale } from 'moment'
const { EMPLOYEE_REPAIRMAN } = CONSTANTS
const Fragment = React.Fragment
const RadioGroup = Radio.Group

class BuildTask extends React.Component {
  constructor(props) {
    super()
    this.state = {
      schoolId: '',
      schoolError: false,
      type: CONSTANTS.TASK_TYPE_REPAIR,
      location: [],
      selectedLocation: [],
      localionName: '',
      residenceId: '',
      locationError: false,
      desc: '',
      descError: false,
      userMobile: '',
      mobileFormatError: false,
      urgency: CONSTANTS.PRIORITY_NORMAL,
      urgencyError: false,
      maintainerType: CONSTANTS.EMPLOYEE_REPAIRMAN,
      maintainerId: '',
      maintainerIdError: false,
      maintainers: {},
      posting: false,
      deviceType: '',
      deviceTypeError: false,
      disabled: false
    }
    this.employeeTypes = {}
    this.employeeTypes[CONSTANTS.EMPLOYEE_REPAIRMAN] = '维修员'
    this.taskTypes = {}
    this.taskTypes[CONSTANTS.TASK_TYPE_REPAIR] = '报修工单'
    this.taskTypes[CONSTANTS.TASK_TYPE_COMPLAINT] = '账单投诉'
    this.taskTypes[CONSTANTS.TASK_TYPE_FEEDBACK] = '意见反馈'
  }
  componentWillMount = () => {
    if (this.props.isChangeRepair) {
      const { schoolId, description, userMobile } = this.props.taskDetailData
      this.setState({
        schoolId: schoolId,
        disabled: true,
        desc: description,
        userMobile,
        type: CONSTANTS.TASK_TYPE_REPAIR
      })
      const { maintainers } = this.state
      if (schoolId) {
        if (!maintainers[schoolId]) {
          const body = {
            page: 1,
            size: 10000,
            schoolId: schoolId,
            department: EMPLOYEE_REPAIRMAN
          }
          this.fetchData(body)
        }
      }
    }
  }
  fetchData = body => {
    let resource = '/api/employee/department/member/list'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          let items = {}
          json.data.employees.forEach(r => {
            items[r.id] = r.name
          })
          let maintainers = Object.assign({}, this.state.maintainers)
          maintainers[body.schoolId] = items
          this.setState({
            maintainers: maintainers
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeSchool = v => {
    let schoolId = parseInt(v, 10)
    let nextState = {
      schoolId: schoolId
    }
    let { schoolError, maintainers, deviceType } = this.state
    if (schoolError) {
      nextState.schoolError = false
    }
    this.setState(nextState)
    if (schoolId) {
      if (!maintainers[schoolId]) {
        const body = {
          page: 1,
          size: 10000,
          schoolId: schoolId,
          department: EMPLOYEE_REPAIRMAN
        }
        this.fetchData(body)
        if (deviceType !== '') {
          this.fetchLocation({
            schoolId: schoolId,
            existDevice: true,
            deviceType: deviceType,
            residenceLevel: 1
          })
        }
      }
    }
  }
  fetchLocation = body => {
    taskService.getLocatonById(body).then(json => {
      if (json.data) {
        const locations = json.data.residences
        locations.forEach((location, index) => {
          location.label = location.name
          location.value = location.id
          location.isLeaf = false
        })
        this.setState({ location: locations })
      }
    })
  }
  loadLocationData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption.loading = true
    const json = {
      parentId: targetOption.id,
      existDevice: true,
      residenceLevel: parseInt(targetOption.type, 10) + 1,
      deviceType: this.state.deviceType
    }
    taskService.getLocatonById(json).then(json => {
      if (json.data) {
        const locations = json.data.residences
        locations.forEach((location, index) => {
          location.label = location.name
          location.value = location.id
          location.isLeaf = location.type === 3 ? true : false
        })
        targetOption.loading = false
        targetOption.children = locations
        this.setState({
          location: [...this.state.location]
        })
      }
    })
  }
  changeType = value => {
    this.setState({
      type: value
    })
  }
  changeDevice = value => {
    this.setState({
      deviceType: value
    })
    const { deviceType, schoolId } = this.state
    if (schoolId) {
      this.fetchLocation({
        schoolId: schoolId,
        existDevice: true,
        deviceType: deviceType,
        residenceLevel: 1
      })
    }
  }
  checkDevice = v => {
    if (!v) {
      return this.setState({
        deviceTypeError: true
      })
    } else if (this.state.deviceTypeError) {
      this.setState({
        deviceTypeError: false
      })
    }
  }
  changeLocation = (value, selectedOptions) => {
    if (value.length < 3) {
      this.setState({
        locationError: true
      })
    } else {
      this.setState({
        locationError: false
      })
    }
    this.setState({
      selectedLocation: value,
      localionName: selectedOptions.map(value => {
        return value.name
      })
    })
  }
  checkLocation = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        locationError: true,
        location: v
      })
    }
    if (this.state.locationError) {
      this.setState({
        locationError: false,
        location: v
      })
    }
  }
  changeDesc = e => {
    let v = e.target.value
    this.setState({
      desc: v
    })
  }
  checkDesc = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        descError: true,
        desc: v
      })
    }
    if (this.state.descError) {
      this.setState({
        descError: false,
        desc: v
      })
    }
  }
  changeMobile = e => {
    this.setState({
      userMobile: e.target.value
    })
  }
  checkMobile = e => {
    let v = e.target.value
    if (!v) {
      return
    }
    if (!/^1[0-9]{10}$/.test(v)) {
      this.setState({
        mobileFormatError: true
      })
    } else if (this.state.mobileFormatError) {
      this.setState({
        mobileFormatError: false
      })
    }
  }
  changeUrgency = e => {
    console.log(e.target.value)
    this.setState({
      urgency: e.target.value
    })
  }
  changeMaintainerType = v => {
    this.setState({
      maintainerType: v
    })
  }
  changeMaintainer = v => {
    this.setState({
      maintainerId: v
    })
    if (this.state.maintainerIdError) {
      this.setState({
        maintainerIdError: false
      })
    }
  }
  cancelSubmit = () => {
    // clear state
    this.setState({
      schoolId: '',
      location: '',
      desc: '',
      userMobile: '',
      urgency: '',
      maintainerId: ''
    })
    // tell parent to close
    this.props.cancel()
  }
  confirm = () => {
    let {
      schoolId,
      selectedLocation,
      desc,
      userMobile,
      urgency,
      maintainerId,
      posting,
      deviceType
    } = this.state
    if (!schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    if (!deviceType) {
      return this.setState({
        deviceTypeError: true
      })
    }
    if (selectedLocation.length !== 3) {
      return this.setState({
        locationError: true
      })
    }
    if (!desc) {
      return this.setState({
        descError: true
      })
    }
    if (!/^1[0-9]{10}$/.test(userMobile)) {
      return this.setState({
        mobileFormatError: true
      })
    }
    if (!urgency) {
      return this.setState({
        urgencyError: true
      })
    }
    if (!maintainerId) {
      return this.setState({
        maintainerIdError: true
      })
    }
    if (posting) {
      return
    }
    this.postData()
  }
  postData = () => {
    let {
      schoolId,
      selectedLocation,
      localionName,
      desc,
      userMobile,
      urgency,
      maintainerType,
      type,
      maintainerId,
      deviceType
    } = this.state
    let resource = '/work/order/add'
    const body = {
      assignId: maintainerId,
      department: parseInt(maintainerType, 10),
      description: desc,
      level: urgency,
      location: localionName.toString(),
      residenceId: selectedLocation[2],
      schoolId: schoolId,
      type: type,
      deviceType: parseInt(deviceType, 10),
      userMobile: userMobile,
      env: CONSTANTS.TASK_BUILD_CMP
    }

    let cb = json => {
      this.setState({
        posting: false
      })
      if (json.data) {
        this.props.success()
      }
    }
    if (this.props.isChangeRepair) {
      resource = '/work/order/parseToRepair'
      body.id = this.props.taskDetailData.id
      cb = json => {
        this.setState({
          posting: false
        })
        if (json.data) {
          if (json.data.result) {
            this.props.success()
            this.props.fetchTaskDetail({ id: this.props.taskDetailData.id })
          } else {
            Noti.hintLock('操作失败', json.data.failReason)
          }
        }
      }
    }
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb)
  }
  insertMsg = () => {
    this.props.changeTask('taskDetail', {
      isShowInsert: true
    })
  }
  closeInsertModal = () => {
    this.props.changeTask('taskDetail', {
      isShowInsert: false
    })
  }
  chooseMsg = content => {
    this.props.changeTask('taskDetail', {
      isShowInsert: false
    })
    let { desc } = this.state
    desc = desc + content
    this.setState({
      desc: desc
    })
  }
  render() {
    const { isShowInsert, isChangeRepair } = this.props
    const {
      schoolError,
      schoolId,
      type,
      location,
      locationError,
      desc,
      descError,
      userMobile,
      mobileFormatError,
      urgency,
      urgencyError,
      maintainerType,
      maintainerId,
      maintainerIdError,
      maintainers,
      deviceType,
      deviceTypeError,
      selectedLocation,
      disabled
    } = this.state

    const maintainerItems =
      schoolId && maintainers[schoolId] ? maintainers[schoolId] : {}

    return (
      <Fragment>
        <Modal
          wrapClassName="modal"
          width={400}
          title={isChangeRepair ? '转为保修工单' : '创建工单'}
          visible
          onCancel={this.cancelSubmit}
          footer={null}
          okText=""
        >
          <div className="info buildTask">
            <ul>
              <li>
                <p>选择学校:</p>
                <SchoolSelector
                  width={CONSTANTS.SELECTWIDTH}
                  disabled={disabled}
                  invalidTitle="选择学校"
                  selectedSchool={schoolId}
                  changeSchool={this.changeSchool}
                />
                {schoolError && (
                  <span className="checkInvalid">学校不能为空！</span>
                )}
              </li>
              <li>
                <p>工单类型:</p>
                <BasicSelector
                  disabled={disabled}
                  width={CONSTANTS.SELECTWIDTH}
                  staticOpts={this.taskTypes}
                  selectedOpt={type}
                  changeOpt={this.changeType}
                />
              </li>
              <li>
                <p>设备类型:</p>
                <DeviceSelector
                  selectedDevice={deviceType}
                  changeDevice={this.changeDevice}
                  checkDevice={this.checkDevice}
                />
                {deviceTypeError && (
                  <span className="checkInvalid">请选择设备类型！</span>
                )}
              </li>
              <li>
                <p>设备位置:</p>
                <Cascader
                  options={location}
                  loadData={this.loadLocationData}
                  onChange={this.changeLocation}
                  value={selectedLocation}
                  changeOnSelect
                  placeholder="选择设备所在位置"
                />
                {locationError && (
                  <span className="checkInvalid">位置请选择房间</span>
                )}
              </li>
              <li className="itemsWrapper">
                <p>问题描述:</p>
                <div className="insertMsg">
                  <textarea
                    value={desc}
                    onChange={this.changeDesc}
                    onBlur={this.checkDesc}
                    placeholder="200字以内"
                  />
                  <a onClick={this.insertMsg}>插入快捷消息</a>
                </div>
                {descError && (
                  <span className="checkInvalid">描述不能为空</span>
                )}
              </li>
              <li>
                <p>用户手机:</p>
                <input
                  value={userMobile}
                  onChange={this.changeMobile}
                  onBlur={this.checkMobile}
                />
                {mobileFormatError && (
                  <span className="checkInvalid">手机号格式不正确!</span>
                )}
              </li>
              <li>
                <p>紧急程度:</p>
                <RadioGroup value={urgency} onChange={this.changeUrgency}>
                  <Radio value={CONSTANTS.PRIORITY_NORMAL}>普通</Radio>
                  <Radio value={CONSTANTS.PRIORITY_PRIOR}>优先</Radio>
                  <Radio value={CONSTANTS.PRIORITY_URGENT}>紧急</Radio>
                </RadioGroup>
                {urgencyError && (
                  <span className="checkInvalid">紧急程度不能为空！</span>
                )}
              </li>
              <li>
                <p>受理人:</p>
                <BasicSelector
                  staticOpts={this.employeeTypes}
                  selectedOpt={maintainerType}
                  changeOpt={this.changeMaintainerType}
                />
              </li>
              <li>
                <p />
                <BasicSelector
                  staticOpts={maintainerItems}
                  selectedOpt={maintainerId}
                  changeOpt={this.changeMaintainer}
                />
                {maintainerIdError && (
                  <span className="checkInvalid">请选择维修员</span>
                )}
              </li>
            </ul>
            <div className="btnArea">
              <Button onClick={this.confirm} type="primary">
                确认
              </Button>
              <Button onClick={this.cancelSubmit}>返回</Button>
            </div>
          </div>
        </Modal>
        {isShowInsert ? (
          <InsertMsgContainer
            closeInsertModal={this.closeInsertModal}
            chooseMsg={this.chooseMsg}
          />
        ) : null}
      </Fragment>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    isChangeRepair: state.taskModule.taskDetail.isChangeRepair,
    taskDetailData: state.taskDetailModal.detail,
    isShowInsert: state.taskModule.taskDetail.isShowInsert
  }
}

export default withRouter(
  connect(mapStateToProps, { changeTask, fetchTaskDetail })(BuildTask)
)
