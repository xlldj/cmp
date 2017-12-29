import React from 'react'
import moment from 'moment'
import {DatePicker, Button} from 'antd'


class RangeSelector extends React.Component{
  constructor(props){
    super()
  }
  changeStartTime = (data) => {
    let st = parseInt(moment(data).valueOf(), 10) 
    if (this.props.changeStartTime) {
      this.props.changeStartTime(st)
    }
  }
  changeEndTime = (data) => {
    let et = parseInt(moment(data).valueOf(), 10) 
    if (this.props.changeEndTime) {
      this.props.changeEndTime(et)
    }
  }
  render(){
    const {startTime, endTime, className} = this.props

    return (
      <div className={className ? `rangeSelect ${className}` : 'rangeSelect '}>
        <DatePicker 
          className='datePicker'
          showTime
          allowClear={false}
          format="YYYY-MM-DD HH:mm"
          value={moment(startTime)}
          onChange={this.changeStartTime}
        />
        <span className='rangeSelect-seperator'>至</span>
        <DatePicker
          className='datePicker'
          showTime
          allowClear={false}
          format="YYYY-MM-DD HH:mm"
          value={moment(endTime)}
          onChange={this.changeEndTime}
        />
        <Button type='primary' className='confirm' onClick={this.confirm} >确认</Button>
      </div>
    )
  }
}

export default RangeSelector
