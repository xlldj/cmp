import React from 'react'
import {Link} from 'react-router-dom'
import {Icon, Input, Button, DatePicker} from 'antd'
import moment from 'moment'

/* ----------如果有searchinput,必须附带searchingtext，onenterpress，changesearch属性--------------- */
const SearchLine = (props) => {
  const desp1 = !!props.leftDespTitle1 && (
    <span className='leftDesp'>
      <span className='title'>{props.leftDespTitle1}</span>
      <span>{props.leftDespDetail1}</span>
    </span>
  )
  const desp2 = !!props.leftDespTitle2 && (
    <span className='leftDesp'>
      <span className='title'>{props.leftDespTitle2}</span>
      <span>{props.leftDespDetail2}</span>
    </span>
  )
  const add = !!props.addTitle && (
    <Link to={props.addLink} >
      <Button type='primary' className='addSchoolBtn'>
        {props.addTitle}
      </Button>
    </Link>
  )
  const add2 = !!props.addTitle2 && (
    <Link to={props.addLink2} >
      <Button type='primary' className='addSchoolBtn'>
        {props.addTitle2}
      </Button>
    </Link>
  )
  const add3 = !!props.addTitle3 && (
    <Link to={props.addLink3} >
      <Button type='primary' className='addSchoolBtn'>
        {props.addTitle3}
      </Button>
    </Link>
  )
  const open = !!props.openTitle && (
    <Button onClick={props.openModal} type='primary'>{props.openTitle}</Button>
  )
  const pressEnter = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return
    }
    props.pressEnter(v)
  }
  return (
    <div className='searchLine'>
      <div className='left'>
        {props.showTimeChoose
          ? <div className='searchLine-timeChoose'>
            <span>{props.timeChooseTitle}</span>
            <DatePicker
              className='timePicker start'
              showTime
              allowClear
              value={props.startTime ? moment(new Date(props.startTime)) : null}
              format='YYYY-MM-DD HH:mm'
              onChange={props.changeStartTime}
              onOk={props.confirmStartTime}
              onOpenChange={props.startTimeOpenChange}
            />
            <span>至</span>
            <DatePicker
              className='timePicker'
              showTime
              allowClear
              value={props.endTime ? moment(new Date(props.endTime)) : null}
              format='YYYY-MM-DD HH:mm'
              onChange={props.changeEndTime}
              onOk={props.confirmEndTime}
              onOpenChange={props.endTimeOpenChange}
            />
          </div>
         : null}
        {desp1}
        {desp2}
        {add}
        {add2}
        {add3}
        {open}
      </div>
      <div className='rightSearch'>
        {props.selector1 ? <div >{props.selector1}</div> : null}
        {props.selector2 ? <div>{props.selector2}</div> : null}
        {props.selector3 ? <div>{props.selector3}</div> : null}
        {props.selector4 ? <div>{props.selector4}</div> : null}
        {props.searchInputText ? (
          <Input prefix={(<div className='test'><Icon type='search' /></div>)} placeholder={props.searchInputText} className='searchInput' value={props.searchingText.toString()} onPressEnter={props.pressEnter} onChange={props.changeSearch} />
        ) : null}
      </div>
    </div>
  )
}

export default SearchLine