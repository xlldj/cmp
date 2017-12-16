import React from 'react'
import moment from '../util/myMoment';

import { Button, DatePicker } from 'antd'

import AjaxHandler from '../ajax'
import Noti from '../noti'
import Time from '../component/time'
import CONSTANTS from '../component/constants'
import DeviceSelectorWithoutAll from '../component/deviceWithoutAll'
import BasicSelector from '../component/basicSelectorWithoutAll'

const RangePicker = DatePicker.RangePicker
const TYPE = {
  1: '时间段',
  2: '期限'
}

class GiftInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
        "amount": '',
        originalAmount: '',
        "timeLimit": "",
        originalTL: '',
        "deviceType": "",
        originalDT: '',
        type: '',
        originalType: '',
        typeError: false,
        "id": 0,
        nameError: false,
        amountError: false,
        timeLimitError:false,
        deviceTypeError: false,
        nameErrorMsg: '',
        startTime: Time.getTodayStart(),
        originalST: '',
        endTime: Time.getMonthEnd(new Date()),
        originalET: '',
        rangeError: false
    }
  }
  fetchData = (body) => {
    let resource='/api/gift/details'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let nextState = {}
            nextState.amount = json.data.amount
            nextState.originalAmount = json.data.amount
            nextState.deviceType = json.data.deviceType.toString()
            nextState.originalDT = json.data.deviceType.toString()
            nextState.id = json.data.id
            nextState.type = json.data.type
            nextState.originalType = json.data.type
            if (json.data.type === 1) {
              nextState.startTime = json.data.startTime
              nextState.originalST = json.data.startTime
              nextState.endTime = json.data.endTime
              nextState.originalET = json.data.endTime
            } else {
              nextState.timeLimit = json.data.timeLimit
              nextState.originalTL = json.data.timeLimit
            }
            this.setState(nextState)
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }  
  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = this.props.match.params.id.slice(1) 
      const body={
        id: id
      }
      this.fetchData(body)
    } 
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  postInfo = () => {
    /*--------note need tell node.js is update or add,we can judge it from props.selectedSchoolId---------*/
    let {amount, deviceType, timeLimit, type, startTime, endTime} = this.state
    let url = '/api/gift/save'
    const body = {
      amount: parseInt(amount, 10),
      deviceType: parseInt(deviceType, 10),
      type: type
    }
    if (type === 1) {
      body.startTime = moment(startTime).valueOf()
      body.endTime = moment(endTime).valueOf()
    } else {
      body.timeLimit = timeLimit
    }
    if(this.props.match.params.id){
      body.id = parseInt(this.props.match.params.id.slice(1), 10)
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          Noti.hintSuccess(this.props.history,'/gift')
        }
    }
    AjaxHandler.ajax(url, body, cb)   
  }
   
  handleSubmit = () => {
    let {id, amount, timeLimit, startTime, endTime, type, deviceType} = this.state
    /*-------------need to check the data here---------------*/
    if(!amount){
      return this.setState({
        amountError: true
      })
    }   
    if (!type) {
      return this.setState({
        typeError: true
      })
    }
    if (type === 1) {
      if (moment(startTime).valueOf() === moment(endTime).valueOf()) {
        return this.setState({
          rangeError: true
        })
      }
    } else {
      if(!timeLimit){
        return this.setState({
          timeLimitError: true
        })
      }
    }
    if(!deviceType || deviceType==='0'){
      return this.setState({
        deviceTypeError: true
      })
    }
    if (id && this.checkSame()) { // 如果完全一样，直接返回 
      this.handleBack()
    } else {
      this.checkExist(this.postInfo)
    }
    // this.postInfo()
  }
  checkSame = () => {
    // deviceType始终是相同的，因为不允许在编辑时更改
    let {amount, timeLimit, startTime, endTime, type,
         originalAmount, originalTL, originalST, originalET, originalType} = this.state

    if (amount !== originalAmount) {
      return false
    }
    if (type !== originalType) {
      return false
    }
    if (type === 1) {
      if (moment(startTime).valueOf() !== moment(originalST).valueOf()) {
        return false
      }
      if (moment(endTime).valueOf() !== moment(originalET).valueOf()) {
        return false
      }
    } else {
      if (timeLimit !== originalTL) {
        return false
      }
    }
    return true
  }
  checkExist = (callback) => {
    let {amount, deviceType, timeLimit, type, startTime, endTime} = this.state
    let url = '/gift/check'
    const body = {
      amount: parseInt(amount, 10),
      deviceType: parseInt(deviceType, 10),
      type: type
    }
    if (type === 1) {
      body.startTime = moment(startTime).valueOf()
      body.endTime = moment(endTime).valueOf()
    } else {
      body.timeLimit = timeLimit
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if (json.data.result) {
          Noti.hintLock('请求出错', '已存在与当前设置完全一样的红包，请勿重复提交')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(url, body, cb) 
  }
  changeAmount = (e) => {
    this.setState({
      amount: e.target.value
    })
  }
  checkAmount = (e) => {
    let v= e.target.value.trim()
    if(!v){
      return this.setState({
        amountError: true
      })
    }
    if(this.state.amountError){
      this.setState({
        amountError: false
      })
    }
  }
  changeTimeLimit = (e) => {
    this.setState({
      timeLimit: e.target.value
    })    
  }
  checkTimeLimit = (e) => {
    let v= e.target.value.trim()
    if(!v){
      return this.setState({
        timeLimitError: true
      })
    }
    if(this.state.timeLimitError){
      this.setState({
        timeLimitError: false
      })
    }    
  }
  changeDevice = (v) => {
    this.setState({
      deviceType: v
    })
  }
  checkDevice = (v) => {
    if (!v || v==='0') {
      return this.setState({
        deviceTypeError: true
      })
    }
    this.setState({
      deviceTypeError: false
    })
  }
  handleBack = () => {
    this.props.history.goBack()
  }
  changeWaterAmount = (e) => {
    this.setState({
      estimation: parseFloat(e.target.value)
    })
  }
  checkWaterAmount = (e) => {
    let {estimation, estimationError} = this.state
    if (!estimation) {
      return this.setState({
        estimationError: true
      })
    }
    if (estimationError) {
      return this.setState({
        estimationError: false
      })
    }
  }
  changeUnit = (v) => {
    this.setState({
      waterUnit: v
    })
  }
  checkUnit = (e) => {
    let {waterUnit, waterUnitError} = this.state
    if (!waterUnit) {
      return this.setState({
        waterUnitError: true
      })
    }
    if (waterUnitError) {
      this.setState({
        waterUnitError: false
      })
    }
  }
  changeType = (v) => {
    this.setState({
      type: parseInt(v, 10)
    })
  }
  checkType = (v) => {
    if (!v) {
      this.setState({
        typeError: true
      })
    }
    if (this.state.typeError) {
      this.setState({
        typeError: false
      })
    }
  }
  changeRange = (dates, dateString) => {
    this.setState({
      startTime: dates[0],
      endTime: dates[1]
    })
    if (moment(dates[0]).valueOf() === moment(dates[1]).valueOf()) {
      this.setState({
        rangeError: true
      })
    }
  }
  render () {
    let {id, amount, amountError, type, typeError, timeLimit, timeLimitError,deviceType, 
          deviceTypeError, startTime, endTime, rangeError} = this.state

    return (
      <div className='infoList'>
        <ul>
          <li>
            <p>红包金额(元)：</p>
            <input type='number' value={amount}  onChange={this.changeAmount} onBlur={this.checkAmount} placeholder="红包金额" /> 
            {amountError?(<span className='checkInvalid'>红包金额不能为空！</span>):null}
          </li>        
          <li>
            <p>使用期限类型：</p>
            <BasicSelector
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={TYPE}
              selectedOpt={type.toString()}
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              invalidTitle='选择类型'
            />
            {typeError ? <span className='checkInvalid'>请选择期限类型！</span> : null}
          </li>
          {
            type === 1 ?
              <li >
                <p>选择时段:</p>
                <RangePicker
                  className='rangePicker'
                  value={[moment(startTime), moment(endTime)]}
                  allowClear={false}
                  format="YYYY/MM/DD"
                  onChange={this.changeRange}
                />
               {rangeError ? <span className='checkInvalid'>开始结束时间不能相同！</span> : null} 
              </li>
            : null
          }
          {
            type === 2 ?
              <li>
                <p>使用期限(天)：</p>
                <input type='number' onChange={this.changeTimeLimit} onBlur={this.checkTimeLimit}  value={timeLimit} />
                {timeLimitError?(<span className='checkInvalid'>红包期限不能为空！</span>):null}
              </li>   
              : null
          }
          <li>
            <p>设备类型：</p>
            <DeviceSelectorWithoutAll 
              width={CONSTANTS.SELECTWIDTH} 
              selectedDevice={deviceType} 
              changeDevice={this.changeDevice}
              checkDevice={this.checkDevice}
              disabled={id}
              className={id ? 'disabled' : ''}
            />
            {deviceTypeError?(<span className='checkInvalid'>请选择设备类型！</span>):null}
          </li>
        </ul>
        <div className='btnArea'>
          <Button type='primary' onClick={this.handleSubmit} >完成</Button>    
          <Button onClick={this.handleBack} >返回</Button>
        </div>
      </div>
    )
  }
}

export default GiftInfo
