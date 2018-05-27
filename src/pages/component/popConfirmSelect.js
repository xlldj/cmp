import React from 'react'
import { Tooltip, Button, Popconfirm } from 'antd'
import Select from './select'
const { Option } = Select
const PopConfirmSelect = props => {
  const { selectOptions, contentConfirm } = props
  const optItems = selectOptions.map((recode, index) => (
    <Option value={recode.id} key={`option${recode.id}`}>
      {recode.name}
    </Option>
  ))
  let { selectedId } = props
  let changeOpt = v => {
    selectedId = v
    props.changeOpt(v)
  }
  let confirmOk = () => {
    props.confirmOk()
  }
  return (
    <Popconfirm
      placement="top"
      overlayClassName="TooltipConfirm"
      onConfirm={confirmOk}
      title={
        <div className="">
          <Select
            value={selectedId}
            disabled={props.disabled ? props.disabled : false}
            width={props.width ? props.width : ''}
            className={props.className ? props.className : 'customSelect'}
            onChange={changeOpt}
            allTitle={props.allTitle}
          >
            {optItems}
          </Select>
        </div>
      }
    >
      {contentConfirm}
    </Popconfirm>
  )
}

export default PopConfirmSelect
