import React from 'react'
import { Button } from 'antd'
import minus from '../assets/minus.png'
import add from '../assets/add.png'

const AddPlusAbs = props => (
  <div className="addPlusabs">
    {props.count > (props.min || 1) && (
      <Button type="primary" className="symbol" onClick={props.abstract}>
        <img src={minus} alt="minus" />
      </Button>
    )}
    <Button type="primary" className="symbol" onClick={props.add}>
      <img src={add} alt="" />
    </Button>
  </div>
)

export default AddPlusAbs
