import React, { Component } from 'react'

import Select from '../component/select';

import {DatePicker, Switch} from 'antd'

import Time from '../component/time'
import Noti from '../noti'
import SchoolSelector from '../component/schoolSelector'
import moment from 'moment'
const {RangePicker} = DatePicker
const DAY = {
  1:'本日',
  2:'本周',
  3:'本月'
}
const LASTDAY = {
  1:'昨日',
  2:'上周',
  3:'上月'
}

const NOW = Date.parse(new Date())

class SelectBar extends React.Component{
  state = {
    selectedSchool:'all',
    timeSpan: 2,
    startTime: Time.getWeekStart(NOW),
    endTime: Time.getWeekEnd(NOW),
    compare: false,
    compareNeed: false,
    compareLock: false,
    timeUnit: 2
  }
  changeSchool = (v) => {
    this.setState({
      selectedSchool: v
    })
    this.props.changeSchool(v)
  }
  changeTimeSpan = (e) => {
    /*-----------if compared,clean it-----------*/
    e.preventDefault()
    let nextState = {}, timeUnit = 2
    let v = parseInt(e.target.getAttribute('data-value')), timeSpan=this.state.timeSpan, newStartTime, newEndTime
    if(v===timeSpan){
      return
    }
    nextState.timeSpan = v
    nextState.compareLock = false

    if(v===1){//today
      newStartTime = Time.getDayStart(NOW)
      newEndTime = Time.getDayEnd(NOW)
      timeUnit = 1
    }else if(v===2){
      newStartTime = Time.getWeekStart(NOW)
      newEndTime = Time.getWeekEnd(NOW)
    }else{
      newStartTime = Time.getMonthStart(NOW)
      newEndTime = Time.getMonthEnd(NOW)
    }

    nextState.startTime = newStartTime
    nextState.endTime = newEndTime
    nextState.timeUnit = timeUnit

    this.props.changeTime(newStartTime, newEndTime)
    this.props.changeTimeSpan(v)
    if (this.state.timeUnit!==timeUnit) {
      this.props.changeTimeUnit(timeUnit)
    }
    this.setState(nextState)
  }
  selectRange = (dates,dateStrings)=>{
    /*-----------------后续需要检查选择的时间间隔大小来确定timeunit----------------*/
    let newStartTime= Time.getDayStart(dateStrings[0]),newEndTime = Time.getDayEnd(dateStrings[1])
    let nextState = {
      startTime: newStartTime,
      endTime: newEndTime,
      compare: false,
      compareLock: true,
    }
    this.props.changeTime(newStartTime, newEndTime)
    if (this.state.compare) {
      this.props.changeCompare(false)
    }
    if (this.state.timeUnit!==2) {
      nextState.timeUnit = 2
      this.props.changeTimeUnit(2)
    }
    this.setState(nextState)
  }
  compareLast = (checked)=>{
    if(this.state.compareLock){
      return Noti.hintLock('当前状态下不能比较！','请选择本日/本周/本月后再进行比较')
    }
    let nextState = {
      compare: checked
    }
    if(checked){
      nextState.compareNeed = true
    }else{
      nextState.compareNeed=false
    }
    this.setState(nextState)
    this.props.changeCompare(checked)
  }
  render () {
    let {timeSpan, startTime, endTime, compare, selectedSchool} = this.state
    return (
      <div className='selectBar'>
        <span>筛选条件</span>

        <div className='selectBox'>
          <SchoolSelector
            selectedSchool={selectedSchool}
            changeSchool={this.changeSchool}
           />
        </div>

        <div className='timespan'>
          <a data-value={1} className={timeSpan===1?'padR on':'padR'} onClick={this.changeTimeSpan} >本日</a>
          <a data-value={2} className={timeSpan===2?'padR on':'padR'} onClick={this.changeTimeSpan} >本周</a>
          <a data-value={3} className={timeSpan===3?'padR on':'padR'} onClick={this.changeTimeSpan} >本月</a> 
          <RangePicker allowClear={false}  value={[moment(Time.getDayFormat(startTime)),moment(Time.getDayFormat(endTime))]} className='rangePicker' onChange={this.selectRange} />
        </div>
        <div className='selCompare'>
          <span className='compare'>对比{LASTDAY[timeSpan]}</span>
          <Switch checked={compare} size='small' onChange={this.compareLast} />
        </div>
      </div>
    )
  }
}
export default SelectBar