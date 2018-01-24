import React from 'react'
import moment from '../../util/myMoment'
import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'

import { Button, DatePicker } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import Time from '../../component/time'
import SchoolSelectWithoutAll from '../../component/schoolSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../component/constants'

const RangePicker = DatePicker.RangePicker

class CashtimeInfo extends React.Component {
  constructor(props) {
    super(props)
    let schoolId = 0,
      schoolError = false,
      type = 0,
      typeError = false,
      initialSchool = 0,
      id = 0
    let fixedTime = {
      endTime: {
        time: { hour: 0, minute: 0 },
        weekday: '1'
      },
      startTime: {
        time: { hour: 0, minute: 0 },
        weekday: '1'
      }
    }
    let specificTime = {
      endTime: Time.getMonthEnd(new Date()),
      startTime: Time.getTodayStart()
    }
    let timeValueError = false
    this.state = {
      schoolId,
      schoolError,
      type,
      specificTime,
      fixedTime,
      typeError,
      initialSchool,
      id,
      timeValueError,
      posting: false
    }
  }
  fetchData = body => {
    let resource = '/api/time/range/withdraw/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let { schoolId, type, specificTime, fixedTime, id } = json.data,
            nextState = {}
          if (json.data.type === 2) {
            nextState.specificTime = specificTime
          } else {
            nextState.fixedTime = fixedTime
          }
          nextState.schoolId = schoolId
          nextState.initialSchool = schoolId
          nextState.type = type
          nextState.id = id
          this.setState(nextState)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      const body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  completeEdit = () => {
    if (!this.state.schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    if (!parseInt(this.state.type, 10)) {
      return this.setState({
        typeError: true
      })
    }
    if (this.state.timeValueError) {
      return
    }
    let { fixedTime, specificTime, type, schoolId, posting } = this.state
    const body = {
      type: parseInt(type, 10),
      schoolId: parseInt(schoolId, 10)
    }
    if (this.state.type === 1) {
      let start = moment(fixedTime.startTime.time).valueOf(),
        end = moment(fixedTime.endTime.time).valueOf()
      let weekStart = fixedTime.startTime.weekday,
        weekEnd = fixedTime.endTime.weekday
      if (weekStart === weekEnd && end <= start) {
        return this.setState({
          timeValueError: true
        })
      }
      body.fixedTime = {
        startTime: {
          time: {
            hour: parseInt(moment(fixedTime.startTime.time).hour(), 10),
            minute: parseInt(moment(fixedTime.startTime.time).minute(), 10)
          },
          weekday: parseInt(fixedTime.startTime.weekday, 10)
        },
        endTime: {
          time: {
            hour: parseInt(moment(fixedTime.endTime.time).hour(), 10),
            minute: parseInt(moment(fixedTime.endTime.time).minute(), 10)
          },
          weekday: parseInt(fixedTime.endTime.weekday, 10)
        }
      }
    } else {
      body.specificTime = {
        startTime: parseInt(moment(specificTime.startTime).valueOf(), 10),
        endTime: parseInt(moment(specificTime.endTime).valueOf(), 10)
      }
    }
    let resource
    if (this.props.match.params.id) {
      body.id = parseInt(this.props.match.params.id.slice(1), 10)
      resource = '/api/time/range/withdraw/update'
    } else {
      resource = '/api/time/range/withdraw/add'
    }
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/fund/cashtime')
        }
      }
    }
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb)
  }
  cancel = () => {
    this.props.history.goBack()
  }
  changeSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let nextState = {}
    if (this.state.schoolError) {
      nextState.schoolError = false
    }
    nextState.schoolId = v
    this.setState(nextState)
  }
  checkSchool = v => {
    if (!parseInt(this.state.schoolId, 10)) {
      return this.setState({
        schoolError: true
      })
    }
    this.setState({
      schoolError: false
    })
    this.checkExist(null)
  }
  confirm = () => {
    let { checking, posting } = this.state
    if (checking || posting) {
      return
    }
    this.checkExist(this.completeEdit)
  }

  checkExist = callback => {
    let { schoolId, id, initialSchool, checking } = this.state

    if (id && parseInt(schoolId, 10) === initialSchool) {
      if (callback) {
        callback()
      }
      return
    }
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/time/range/withdraw/check'
    const body = {
      schoolId: parseInt(schoolId, 10)
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintLock('操作出错', '当前学校已有提现时间设置，请勿重复添加')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  changeType = v => {
    if (!v) {
      return this.setState({
        typeError: true
      })
    }
    let nextState = {}
    if (this.state.typeError) {
      nextState.typeError = false
    }
    nextState.type = parseInt(v, 10)
    this.setState(nextState)
  }
  changeStartDay = v => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)),
      nextState = {}
    fixedTime.startTime.weekday = v
    let end = moment(fixedTime.endTime.time).valueOf(),
      start = moment(fixedTime.startTime.time).valueOf()

    let weekStart = v,
      weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeEndDay = v => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)),
      nextState = {}
    fixedTime.endTime.weekday = v
    let end = moment(fixedTime.endTime.time).valueOf(),
      start = moment(fixedTime.startTime.time).valueOf()

    let weekStart = fixedTime.startTime.weekday,
      weekEnd = v
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeStartTime = v => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)),
      nextState = {}
    fixedTime.startTime.time = v
    let end = moment(fixedTime.endTime.time).valueOf(),
      start = v.valueOf()
    let weekStart = fixedTime.startTime.weekday,
      weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState({ fixedTime: fixedTime })
  }
  changeEndTime = v => {
    let fixedTime = JSON.parse(JSON.stringify(this.state.fixedTime)),
      nextState = {}
    fixedTime.endTime.time = v
    let start = moment(fixedTime.startTime.time).valueOf(),
      end = v.valueOf()
    let weekStart = fixedTime.startTime.weekday,
      weekEnd = fixedTime.endTime.weekday
    if (weekStart === weekEnd && end <= start) {
      nextState.timeValueError = true
    } else if (this.state.timeValueError === true) {
      nextState.timeValueError = false
    }
    nextState.fixedTime = fixedTime
    this.setState(nextState)
  }
  changeRange = (dates, dateString) => {
    let specificTime = JSON.parse(JSON.stringify(this.state.specificTime))
    specificTime.startTime = dates[0]
    specificTime.endTime = dates[1]
    this.setState({
      specificTime: specificTime
    })
  }

  render() {
    let {
      typeError,
      schoolId,
      schoolError,
      specificTime,
      fixedTime,
      type,
      timeValueError,
      initialSchool
    } = this.state
    const fixedItem = (
      <li>
        <p>选择时段:</p>
        <span>
          <span className="mg10">每周</span>
          <BasicSelectorWithoutAll
            staticOpts={CONSTANTS.WEEKDAYS}
            width={70}
            selectedOpt={fixedTime.startTime.weekday}
            changeOpt={this.changeStartDay}
          />
          <TimePicker
            className="timepicker"
            allowEmpty={false}
            showSecond={false}
            value={moment(fixedTime.startTime.time)}
            onChange={this.changeStartTime}
          />
          <span>~</span>
          <span className="mg10">每周</span>
          <BasicSelectorWithoutAll
            staticOpts={CONSTANTS.WEEKDAYS}
            width={70}
            selectedOpt={fixedTime.endTime.weekday}
            changeOpt={this.changeEndDay}
          />
          <TimePicker
            className="timepicker"
            allowEmpty={false}
            showSecond={false}
            value={moment(fixedTime.endTime.time)}
            onChange={this.changeEndTime}
          />
        </span>
        {timeValueError ? (
          <span className="checkInvalid">结束时间应大于开始时间！</span>
        ) : null}
      </li>
    )
    const specificItem = (
      <li>
        <p>选择时段:</p>
        <RangePicker
          className="rangePicker"
          value={[moment(specificTime.startTime), moment(specificTime.endTime)]}
          allowClear={false}
          format="YYYY/MM/DD"
          onChange={this.changeRange}
        />
      </li>
    )

    return (
      <div className="infoList cashtimeInfo">
        <ul>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              width={'140px'}
              disabled={initialSchool}
              className={initialSchool ? 'disabled' : ''}
              selectedSchool={schoolId.toString()}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>时间类型:</p>
            <BasicSelectorWithoutAll
              invalidTitle="选择类型"
              staticOpts={CONSTANTS.WITHDRAWTIME}
              width={'140px'}
              selectedOpt={type}
              changeOpt={this.changeType}
            />
            {typeError ? (
              <span className="checkInvalid">时间类型不能为空！</span>
            ) : null}
          </li>

          {type === 1 ? fixedItem : type === 2 ? specificItem : null}
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.cancel}>返回</Button>
        </div>
      </div>
    )
  }
}

export default CashtimeInfo
