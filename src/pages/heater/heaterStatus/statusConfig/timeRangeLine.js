import React from 'react'
import { Switch } from 'antd'
import TimeSelect from '../../../component/timeSelect'
const TimeRangeLine = props => {
  let {
    className,
    label,
    startTime,
    endTime,
    children,
    checked,
    changeStartTime,
    changeEndTime,
    showErrorHint
  } = props
  return (
    <div className={className ? `${className} timeRangeLine` : 'timeRangeLine'}>
      <label className="timeRangeLineLabel">{label}:</label>
      <TimeSelect
        startTime={startTime}
        endTime={endTime}
        changeStartTime={changeStartTime}
        changeEndTime={changeEndTime}
      />
      {children}
      <Switch
        checked={checked || false}
        className="seperator"
        onChange={props.toggleSwitch}
      />
      {showErrorHint ? (
        <span className="checkInvalid">请填写完整信息！</span>
      ) : null}
    </div>
  )
}
export default TimeRangeLine
