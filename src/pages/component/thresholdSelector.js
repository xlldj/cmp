import React from 'react'
import CONSTANTS from '../../constants'
import BasicSelector from './basicSelectorWithoutAll'
const { THRESHOLD_TYPE_ENUMS } = CONSTANTS

const ThresholdSelector = props => {
  return (
    <BasicSelector
      className="thresholdSelector"
      staticOpts={THRESHOLD_TYPE_ENUMS}
      changeOpt={props.changeThreshold}
      selectedOpt={props.value}
    />
  )
}
export default ThresholdSelector
