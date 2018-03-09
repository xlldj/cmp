import React from 'react'
import { TimePicker } from 'antd'
import moment from 'moment'

const TimeSelect = props => {
  const {
    startTime,
    endTime,
    className,
    changeStartTime,
    changeEndTime
  } = props

  return (
    <div className={className ? `rangeSelect ${className}` : 'rangeSelect '}>
      <TimePicker
        className=""
        format="HH:mm"
        value={startTime ? moment(startTime) : null}
        onChange={changeStartTime}
      />
      <span className="rangeSelect-seperator">至</span>
      <TimePicker
        format="HH:mm"
        value={endTime ? moment(endTime) : null}
        onChange={changeEndTime}
      />
    </div>
  )
}

export default TimeSelect
