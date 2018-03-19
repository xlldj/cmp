import React from 'react'
import moment from 'moment'
import { DatePicker, Button } from 'antd'

class RangeSelector extends React.Component {
  constructor(props) {
    super()
  }
  changeStartTime = data => {
    let st = parseInt(moment(data).valueOf(), 10)
    if (this.props.changeStartTime) {
      this.props.changeStartTime(st)
    }
  }
  changeEndTime = data => {
    let et = parseInt(moment(data).valueOf(), 10)
    if (this.props.changeEndTime) {
      this.props.changeEndTime(et)
    }
  }
  confirm = () => {
    if (this.props.confirm) {
      this.props.confirm()
    }
  }
  render() {
    const { startTime, endTime, className } = this.props
    const disabledDate = function(current) {
      // can not select days after today
      if (!!current) {
        debugger
        return current && current.getTime() > Date.now()
      }
      return true
    }

    return (
      <div className={className ? `rangeSelect ${className}` : 'rangeSelect '}>
        <DatePicker
          className="datePicker"
          showTime
          allowClear={false}
          format="YYYY-MM-DD HH:mm"
          value={startTime ? moment(startTime) : null}
          onChange={this.changeStartTime}
          disabledDate={disabledDate}
        />
        <span className="rangeSelect-seperator">至</span>
        <DatePicker
          className="datePicker"
          showTime
          allowClear={false}
          format="YYYY-MM-DD HH:mm"
          value={endTime ? moment(endTime) : null}
          onChange={this.changeEndTime}
        />
        <Button type="primary" className="confirm" onClick={this.confirm}>
          确认
        </Button>
      </div>
    )
  }
}

export default RangeSelector
