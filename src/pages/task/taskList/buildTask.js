import React from 'react'
import { Button, Radio, Modal } from 'antd'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import DeviceSelector from '../../component/deviceWithoutAll'
import CONSTANTS from '../../../constants'
import AjaxHandler from '../../../util/ajax'
// import { locale } from 'moment'
const { EMPLOYEE_REPAIRMAN } = CONSTANTS

const RadioGroup = Radio.Group

class BuildTask extends React.Component {
  constructor(props) {
    super()
    this.state = {
      schoolId: '',
      schoolError: false,
      type: CONSTANTS.TASK_TYPE_REPAIR,
      location: '',
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
      deviceTypeError: false
    }
    this.employeeTypes = {}
    this.employeeTypes[CONSTANTS.EMPLOYEE_REPAIRMAN] = '维修员'
    this.taskTypes = {}
    this.taskTypes[CONSTANTS.TASK_TYPE_REPAIR] = '报修工单'
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
    let { schoolError, maintainers } = this.state
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
      }
    }
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
  changeLocation = e => {
    let v = e.target.value
    this.setState({
      location: v
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
      location,
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
    if (!location) {
      return this.setState({
        locationError: true
      })
    }
    if (!desc) {
      return this.setState({
        descError: true
      })
    }
    if (!/^1[3|4|5|7|8][0-9]{9}$/.test(userMobile)) {
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
      location,
      desc,
      userMobile,
      urgency,
      maintainerType,
      maintainerId,
      deviceType
    } = this.state
    let resource = '/work/order/add'
    const body = {
      assignId: maintainerId,
      department: parseInt(maintainerType, 10),
      description: desc,
      level: urgency,
      location: location,
      schoolId: schoolId,
      type: maintainerType,
      deviceType: parseInt(deviceType, 10),
      userMobile: userMobile,
      env: CONSTANTS.TASK_BUILD_CMP
    }
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.data) {
        this.props.success()
      }
    }
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb)
  }
  render() {
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
      deviceTypeError
    } = this.state

    const maintainerItems =
      schoolId && maintainers[schoolId] ? maintainers[schoolId] : {}

    return (
      <Modal
        wrapClassName="modal"
        width={400}
        title="创建工单"
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
              <input
                value={location}
                onChange={this.changeLocation}
                onBlur={this.checkLocation}
              />
              {locationError && (
                <span className="checkInvalid">位置不能为空</span>
              )}
            </li>
            <li className="itemsWrapper">
              <p>问题描述:</p>
              <textarea
                value={desc}
                onChange={this.changeDesc}
                onBlur={this.checkDesc}
                placeholder="200字以内"
              />
              {descError && <span className="checkInvalid">描述不能为空</span>}
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
    )
  }
}

export default BuildTask
