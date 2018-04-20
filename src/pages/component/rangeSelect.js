import React from 'react'
import moment from 'moment'
import { DatePicker, Button } from 'antd'

class RangeSelector extends React.Component {
  constructor(props) {
    super()
  }
  changeStartTime = data => {
    // startime alway begins with 0:00
    let st = parseInt(
      moment(data)
        .startOf('day')
        .valueOf(),
      10
    )
    if (this.props.changeStartTime) {
      this.props.changeStartTime(st)
    }
  }
  changeEndTime = data => {
    // endTime always end with 23:59
    let et = parseInt(
      moment(data)
        .endOf('day')
        .valueOf(),
      10
    )
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

    return (
      <div className={className ? `rangeSelect ${className}` : 'rangeSelect '}>
        <DatePicker
          className="datePicker"
          showTime
          allowClear={false}
          format="YYYY-MM-DD HH:mm"
          value={startTime ? moment(startTime) : null}
          onChange={this.changeStartTime}
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
