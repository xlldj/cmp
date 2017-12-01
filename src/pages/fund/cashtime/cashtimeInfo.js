import React from 'react'
import moment from '../../util/myMoment';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import {Button, DatePicker} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import Time from '../../component/time'
import AddPlusAbs from '../../component/addPlusAbs'
import SchoolSelectWithoutAll from '../../component/schoolSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../component/constants'

const RangePicker = DatePicker.RangePicker

class CashtimeInfo extends React.Component {
  constructor (props) {
    super(props)
    let schoolId = 0, schoolError= false, type= 0, typeError= false, initialSchool = 0, id = 0
    let fixedTime={
      endTime: {
        time: {hour:0, minute: 0}, 
        weekday: '1'
      }, 
      startTime: {
        time: {hour:0, minute: 0}, 
        weekday: '1'
      }
    }
    let specificTime = {
      "endTime": Time.getMonthEnd(new Date()),
      "startTime": Time.getTodayStart()
    }
    let timeValueError = false
    this.state = { 
      schoolId, schoolError, type, specificTime, fixedTime, typeError, initialSchool, id, timeValueError
    }
  }
  fetchData =(body)=>{
    let resource='/api/time/range/withdraw/one'
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let {schoolId, type, specificTime, fixedTime, id} = json.data, nextState = {}
          if (json.data.type === 2) {
            nextState.specificTime = specificTime
          } else {
            nextState.fixedTime = fixedTime
          }
          nextState.schoolId = schoolId
          nextState.initialSchool = schoolId
          nextState.type = type
          nextState.id = id
          this.setState(nextState)
        }else{
          throw new Error(json.error.displayMessage || json.error)
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      const body={
        id:parseInt(this.props.match.params.id.slice(1))
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  completeEdit = () => {
    if (!this.state.schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    if (!parseInt(this.state.type)) {
      return this.setState({
        typeError: true
      })
    }
    if (this.state.timeValueError) {
      return
    }
    let {fixedTime, specificTime, type, schoolId} = this.state
    const body = {
      type: parseInt(type),
      schoolId: parseInt(schoolId)
    }
    if (this.state.type === 1) {
      let start = moment(fixedTime.startTime.time).valueOf(), end = moment(fixedTime.endTime.time).valueOf()
      let weekStart = fixedTime.startTime.weekday, weekEnd = fixedTime.endTime.weekday
      if (weekStart === weekEnd && end <= start) {
        return this.setState({
          timeValueError: true
        })
      }
      body.fixedTime = {
        startTime: {
          time: {
            hour: parseInt(moment(fixedTime.startTime.time).hour()),
            minute: parseInt(moment(fixedTime.startTime.time).minute())
          },
          weekday: parseInt(fixedTime.startTime.weekday),
        }, 
        endTime: {
          time: {
            hour: parseInt(moment(fixedTime.endTime.time).hour()),
            minute: parseInt(moment(fixedTime.endTime.time).minute())
          },
          weekday: parseInt(fixedTime.endTime.weekday),
        }
      }
    } else {
      body.specificTime = {
        startTime: parseInt(moment(specificTime.startTime).valueOf()),
        endTime: parseInt(moment(specificTime.endTime).valueOf())
      }
    }
    let resource
    if(this.props.match.params.id){
      body.id = parseInt(this.props.match.params.id.slice(1))
      resource = '/api/time/range/withdraw/update'
    } else {
      resource = '/api/time/range/withdraw/add'
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            Noti.hintSuccess(this.props.history,'/fund/cashtime')
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  cancel = () => {
    this.props.history.goBack()
  }
  changeSchool = (v) => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let nextState = {}
    if (this.state.schoolError) {
      nextState.schoolError = false
    }
    nextState.schoolId = v
    this.setState(nextState)
  }
  checkSchool = (v) => {
    if (!parseInt(this.state.schoolId)) {
      return this.setState({
        schoolError: true
      })
    }
    this.setState({
      schoolError: false
    })
    this.checkExist(null)
  }
  confirm = () => {
    this.checkExist(this.completeEdit)
  }

  checkExist = (callback) => {
    let {schoolId, id, initialSchool} = this.state
    if (id && (parseInt(schoolId) === initialSchool) ) {
      if (callback) {
        callback()
      }
      return
    }
    let resource = '/time/range/withdraw/check'
    const body = {
      schoolId: parseInt(schoolId)
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          Noti.hintLock('操作出错', '当前学校已有提现时间设置，请勿重复添加')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  changeType = (v) => {
    if (!v) {
      return this.setState({
        typeError: true
      })
    }
    let nextState = {}
    if (this.state.typeError) {
      nextState.typeError = false
    }
    nextState.type = parseInt(v)
    this.setState(nextState)
  }
  changeStartDay = (v) => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)), nextState = {}
    fixedTime.startTime.weekday = v
    let end = moment(fixedTime.endTime.time).valueOf(), start = moment(fixedTime.startTime.time).valueOf()

    let weekStart = v, weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeEndDay = (v) => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)), nextState = {}
    fixedTime.endTime.weekday = v
    let end = moment(fixedTime.endTime.time).valueOf(), start = moment(fixedTime.startTime.time).valueOf()

    let weekStart = fixedTime.startTime.weekday, weekEnd = v
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeStartTime = (v) => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)), nextState = {}
    fixedTime.startTime.time = v
    let end = moment(fixedTime.endTime.time).valueOf(), start = v.valueOf()
    let weekStart = fixedTime.startTime.weekday, weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState({fixedTime: fixedTime})
  }
  changeEndTime = (v) => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)), nextState = {}
    fixedTime.endTime.time = v
    let start = moment(fixedTime.startTime.time).valueOf(), end = v.valueOf()
    let weekStart = fixedTime.startTime.weekday, weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeRange = (dates, dateString) => {
    let specificTime = JSON.parse(JSON.stringify(this.state.specificTime))
    specificTime.startTime = dates[0]
    specificTime.endTime = dates[1]
    this.setState({
      specificTime: specificTime
    })
  }

  render () {
    let {typeError, schoolId, schoolError, specificTime, fixedTime, type, timeValueError, initialSchool} = this.state
    const fixedItem = (
      <li>
        <p>选择时段:</p>
        <span>
          <span className='mg10'>每周</span>
          <BasicSelectorWithoutAll staticOpts={CONSTANTS.WEEKDAYS} width={70} selectedOpt={fixedTime.startTime.weekday} changeOpt={this.changeStartDay} />
          <TimePicker
            className='timepicker'
            allowEmpty={false}
            showSecond={false}
            value={moment(fixedTime.startTime.time)}
            onChange={this.changeStartTime}
          />
          <span >~</span>
          <span className='mg10'>每周</span>
          <BasicSelectorWithoutAll staticOpts={CONSTANTS.WEEKDAYS} width={70} selectedOpt={fixedTime.endTime.weekday} changeOpt={this.changeEndDay} />
          <TimePicker
            className='timepicker'
            allowEmpty={false}
            showSecond={false}
            value={moment(fixedTime.endTime.time)}
            onChange={this.changeEndTime}
          />
        </span>
        {timeValueError ? <span className='checkInvalid'>结束时间应大于开始时间！</span> : null }
      </li>
    )
    const specificItem = (
      <li >
        <p>选择时段:</p>
        <RangePicker
          className='rangePicker'
          value={[moment(specificTime.startTime), moment(specificTime.endTime)]}
          allowClear={false}
          format="YYYY/MM/DD"
          onChange={this.changeRange}
        />
      </li>
    )

    return (
      <div className='infoList cashtimeInfo'>
        <ul>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              width={'140px'}
              disabled={initialSchool}
              className={initialSchool ? 'disabled' : ''}
              selectedSchool={schoolId.toString()} 
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            /> 
            {schoolError?<span className='checkInvalid'>学校不能为空！</span>:null}
          </li>
          <li>
            <p>时间类型:</p>
            <BasicSelectorWithoutAll 
              invalidTitle='选择类型' 
              staticOpts={CONSTANTS.WITHDRAWTIME} 
              width={'140px'} 
              selectedOpt={type} 
              changeOpt={this.changeType} 
            />
            {typeError?<span className='checkInvalid'>时间类型不能为空！</span>:null}        
          </li>

          {type === 1 ? fixedItem : (type === 2 ? specificItem : null)}    
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm} >确认</Button>
          <Button onClick={this.cancel} >返回</Button>
        </div>
      </div>
    )
  }
}

export default CashtimeInfo
