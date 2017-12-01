import React from 'react'
import Select from './select'
const {Option} = Select

class StatusSelector extends React.Component{
  constructor(props){
    super()
  }
  changeStatus = (v) => {
    this.props.changeStatus(v)
  }
  render(){
    const STATUS = {
      1: '正常',
      2: '待维修',
      3: '维修中'
    }
    let ss = Object.keys(STATUS)
    const statusOpts = ss.map((s, i) => (
      <Option value={s.toString()} key={s}>{STATUS[s]}</Option>
    ))

    return (
      <Select
        width={this.props.width ? this.props.width : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeStatus} 
        all
        allTitle='全部状态'
        value={this.props.selectedStatus || 'all'}
      >
        {statusOpts}
      </Select>
    )
  }
}

export default StatusSelector
