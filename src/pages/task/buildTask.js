import React from 'react'
import {Button, Radio, Modal} from 'antd'
import SchoolSelector from '../component/schoolSelectorWithoutAll'
import BasicSelector from '../component/basicSelectorWithoutAll'
import CONSTANTS from '../component/constants'
import { obj2arr } from '../util/types'
import AjaxHandler from '../ajax'

const RadioGroup = Radio.Group

class BuildTask extends React.Component {
  constructor (props) {
    super()
    this.state = {
      schoolId: '',
      type: 1,
      location: '',
      desc: '',
      descError: false,
      userMobile: '',
      urgency: '',
      maintainerType: 1,
      maintainerId: '',
      maintainers: {}
    }
  }
  fetchData = (body) => {
    let resource='/api/employee/repairman/list'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let items = {}
            json.data.repairmans.forEach(r => {
              items[r.userId] = r.username
            })
            let maintainers = Object.assign({}, this.state.maintainers)
            maintainers[body.schoolId] = items
            this.setState({
              maintainers: maintainers
            })
          }       
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  changeSchool = (v) => {
    let schoolId = parseInt(v, 10)
    let nextState = {
      schoolId: schoolId
    }
    let {schoolError, maintainers} = this.state
    if (schoolError) {
      nextState.schoolError = false
    }
    this.setState(nextState)
    if (schoolId) {
      if (!maintainers[schoolId]) {
        const body = {
          page: 1, 
          size: 10000,
          schoolId: schoolId
        }
        this.fetchData(body)
      }
    }
  }
  changeType = (value) => {
    this.setState({
      type: value
    })
  }
  changeLocation = (e) => {
    let v = e.target.value
    this.setState({
      location: v
    })
  }
  checkLocation = (e) => {
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
  changeDesc = (e) => {
    let v = e.target.value
    this.setState({
      desc: v
    })
  }
  checkDesc = (e) => {
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
  changeMobile = (e) => {
    this.setState({
      userMobile: e.target.value
    })
  }
  checkMobile = (e) => {
    let v = e.target.value
    if (!v) {
      return
    }
    if (!/^1[3|4|5|7|8][0-9]{9}$/.test(v)) {
      this.setState({
        mobileFormatError: true
      })
    } else if (this.state.mobileFormatError) {
      this.setState({
        mobileFormatError: false
      })
    }
  }
  changeUrgency = (e) => {
    this.setState({
      urgency: e.target.value
    })
  }
  changeMaintainerType = (v) => {
    this.setState({
      maintainerType: v
    })
  }
  changeMaintainer = (v) => {
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
  render () {
    const {schoolError, schoolId, type, location, locationError, desc, descError,
      userMobile, mobileFormatError, urgency, urgencyError, maintainerType, maintainerId, maintainerIdError,
      maintainers
    } = this.state

    const maintainerItems = (schoolId && maintainers[schoolId]) ? maintainers[schoolId] : {}

    return (
      <Modal
        wrapClassName='modal'
        width={400}
        title='创建工单'
        visible
        onCancel={this.cancelSubmit}
        footer={null}
        okText=''
      >
        <div className='info buildTask'>
          <ul>
            <li>
              <p>选择学校:</p>
              <SchoolSelector
                width={CONSTANTS.SELECTWIDTH}
                invalidTitle='选择学校'
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
            />
              {schoolError && (<span className='checkInvalid'>学校不能为空！</span>)}
            </li>
            <li>
              <p>工单类型:</p>
              <BasicSelector
                width={CONSTANTS.SELECTWIDTH}
                staticOpts={{1: '报修工单'}}
                selectedOpt={type}
                changeOpt={this.changeType}
              />
            </li>
            <li>
              <p>设备位置:</p>
              <input
                value={location}
                onChange={this.changeLocation}
                onBlur={this.checkLocation}
            />
              {locationError && (<span className='checkInvalid'>位置不能为空</span>)}
            </li>
            <li className='itemsWrapper'>
              <p>问题描述:</p>
              <textarea
                value={desc}
                onChange={this.changeDesc}
                onBlur={this.checkDesc}
              />
              {descError && (<span className='checkInvalid'>描述不能为空</span>)}
            </li>
            <li>
              <p>用户手机:</p>
              <input
                value={userMobile}
                onChange={this.changeMobile}
                onBlur={this.checkMobile}
              />
              {mobileFormatError && (<span className='checkInvalid'>手机号格式不正确!</span>)}
            </li>
            <li>
              <p>紧急程度:</p>
              <RadioGroup value={urgency} onChange={this.changeUrgency} >
                <Radio value={1}>普通</Radio>
                <Radio value={2}>优先</Radio>
                <Radio value={3}>紧急</Radio>
              </RadioGroup>
              {urgencyError && (<span className='checkInvalid'>紧急程度不能为空！</span>)}
            </li>
            <li>
              <p>受理人:</p>
              <BasicSelector
                staticOpts={{1: '维修员'}}
                selectedOpt={maintainerType}
                changeOpt={this.changeMaintainerType}
              />
            </li>
            <li>
              <p></p>
              <BasicSelector
                staticOpts={maintainerItems}
                selectedOpt={maintainerId}
                changeOpt={this.changeMaintainer}
              />
              {maintainerIdError && (<span className='checkInvalid'>请选择维修员</span>)}
            </li>
          </ul>
        <div className='btnArea'>
          <Button onClick={this.confirm} type='primary'>确认</Button>
          <Button onClick={this.cancelSubmit} >返回</Button>
        </div>
        </div>

      </Modal>
    )
  }
}

export default BuildTask