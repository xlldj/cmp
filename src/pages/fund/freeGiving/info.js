import React from 'react'
import moment from '../../../util/myMoment'

import { Button, TimePicker, Radio, Popconfirm } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../../constants'
import { generateMonthDayEnums } from '../../../util/dayHandle.js'
import { checkObject } from '../../../util/checkSame'
const {
  FREEGIVING_PERIOD,
  FREEGIVING_PERIOD_MONTH,
  FREEGIVING_ONLINE,
  FREEGIVING_OFFLINE,
  FREEGIVING_TARGETS
} = CONSTANTS
const MONTH_DAY_ENUMS = generateMonthDayEnums()
const RadioGroup = Radio.Group

class FreeGivingInfo extends React.Component {
  constructor(props) {
    super(props)
    let schoolId = 0,
      schoolError = false,
      initialSchool = 0,
      id = 0
    this.state = {
      id,
      schoolId,
      schoolError,
      initialSchool,
      amount: '',
      amountError: false,
      startDay: 1,
      startDayError: false,
      endDay: -1,
      endDayError: false,
      period: 1,
      periodError: false,
      status: '',
      statusError: false,

      startTime: {
        hour: 0,
        minute: 0
      },
      endTime: {
        hour: 23,
        minute: 59
      },

      posting: false,
      released: false,

      schoolOpts: {},
      validateTimeOption: '',
      validateTimeOptionError: false,

      target: '',
      targetError: false
    }
  }
  fetchData = body => {
    let resource = '/api/givingRule/activity/one'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        const {
          schoolId,
          id,
          startDay,
          endDay,
          startHour,
          endHour,
          startMinute,
          endMinute,
          period,
          amount,
          target,
          status,
          validateTimeOption
        } = json.data
        const nextState = {
          schoolId,
          id,
          period,
          amount,
          status,
          target,
          validateTimeOption
        }
        nextState.initialSchool = schoolId
        nextState.startTime = {
          hour: startHour,
          minute: startMinute
        }
        nextState.endTime = {
          hour: endHour,
          minute: endMinute
        }
        if (period === FREEGIVING_PERIOD_MONTH) {
          nextState.startDay = startDay
          nextState.endDay = endDay
        }
        if (status === FREEGIVING_ONLINE) {
          nextState.released = true
        } else if (this.state.released) {
          nextState.released = false
        }
        this.setState(nextState)
      }
    })
  }

  componentDidMount() {
    if (this.props.match.params.id) {
      const body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
    }
    if (this.props.schoolSet) {
      this.setSchoolOpts(this.props)
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!checkObject(this.props.schools, nextProps.schools, ['schoolSet'])) {
      this.setSchoolOpts(nextProps)
    }
  }
  setSchoolOpts = props => {
    const fox_index = props.schools.findIndex(s => s.name === '富士康')
    if (fox_index !== -1) {
      const school = props.schools[fox_index]
      const schoolOpts = {}
      schoolOpts[school.id] = school.name
      this.setState({
        schoolOpts,
        schoolId: school.id
      })
    }
  }
  /**
   * check if inputs are ready, note 'startTime' and 'endTime' does not need checking.
   */
  checkComplete = () => {
    const {
      schoolId,
      amount,
      period,
      startDay,
      endDay,
      status,
      target,
      validateTimeOption
    } = this.state
    if (!schoolId) {
      this.setState({
        schoolError: true
      })
      return false
    }
    if (!amount) {
      this.setState({
        amountError: true
      })
      return false
    }
    if (!period) {
      this.setState({
        periodError: true
      })

      return false
    }
    if (period === FREEGIVING_PERIOD_MONTH && !startDay) {
      this.setState({
        startDayError: true
      })
      return false
    }
    if (period === FREEGIVING_PERIOD_MONTH && !endDay) {
      this.setState({
        endDayError: true
      })
      return false
    }
    if (!target) {
      this.setState({
        targetError: true
      })
      return false
    }
    if (!validateTimeOption) {
      this.setState({
        validateTimeOptionError: true
      })
      return false
    } else if (this.state.validateTimeOptionError) {
      this.setState({
        validateTimeOptionError: false
      })
    }
    if (!status) {
      this.setState({
        statusError: true
      })
      return false
    }
    return true
  }
  postInfo = () => {
    const {
      schoolId,
      amount,
      period,
      startDay,
      endDay,
      startTime,
      endTime,
      status,
      released,
      posting,
      validateTimeOption
    } = this.state
    if (posting) {
      return
    }
    const body = {
      schoolId: parseInt(schoolId, 10),
      amount: +amount,
      period,
      startHour: moment(startTime).hour(),
      startMinute: moment(startTime).minute(),
      endHour: moment(endTime).hour(),
      endMinute: moment(endTime).minute(),
      status: +status,
      validateTimeOption: +validateTimeOption
    }
    if (period === FREEGIVING_PERIOD_MONTH) {
      body.startDay = +startDay
      body.endDay = +endDay
    }
    const resource = '/api/givingRule/activity/save'
    if (this.props.match.params.id) {
      body.id = parseInt(this.props.match.params.id.slice(1), 10)
    }
    this.setState({
      posting: true
    })
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = {
        posting: false
      }
      if (json && json.data) {
        // original released and online, now offline, don't route back
        if (released && status === FREEGIVING_OFFLINE) {
          Noti.hintOk('当前活动已下线', '您可以对此活动继续编辑！')
          nextState.released = false
        } else {
          Noti.hintSuccess(this.props.history, '/fund/freeGiving')
        }
      }
      this.setState(nextState)
    })
  }
  back = () => {
    this.props.history.goBack()
  }
  changeSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let nextState = { schoolId: v }
    if (this.state.schoolError) {
      nextState.schoolError = false
    }
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
  }
  changeAmount = e => {
    this.setState({
      amount: e.target.value
    })
  }
  checkAmount = e => {
    const { amountError } = this.state
    const v = e.target.value.trim()
    const nextState = { amount: v }
    if (!v) {
      nextState.amountError = true
    } else if (amountError) {
      nextState.amountError = false
    }
    this.setState(nextState)
  }
  changePeriod = v => {
    this.setState({
      period: +v
    })
  }
  checkPeriod = v => {
    const { periodError } = this.state
    const nextState = {}
    if (!v) {
      nextState.periodError = true
    } else if (periodError) {
      nextState.periodError = false
    }
    this.setState(nextState)
  }
  changeTarget = v => {
    this.setState({
      target: +v
    })
  }
  checkTarget = v => {
    const { targetError } = this.state
    const nextState = {}
    if (!v) {
      nextState.targetError = true
    } else if (targetError) {
      nextState.targetError = false
    }
    this.setState(nextState)
  }
  confirm = () => {
    let { checking, posting } = this.state
    if (checking || posting) {
      return
    }
    if (!this.checkComplete()) {
      return
    }
    this.checkExist(this.postInfo)
  }
  checkExist = callback => {
    let {
      schoolId,
      id,
      initialSchool,
      checking,
      amount,
      period,
      startDay,
      startTime,
      endDay,
      endTime,
      target,
      status,
      validateTimeOption
    } = this.state

    // still the same school, no need to check.
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
    let resource = '/api/givingRule/activity/check'
    const body = {
      schoolId: parseInt(schoolId, 10),
      amount: +amount,
      period,
      startHour: moment(startTime).hour(),
      startMinute: moment(startTime).minute(),
      endHour: moment(endTime).hour(),
      endMinute: moment(endTime).minute(),
      status: +status,
      validateTimeOption: +validateTimeOption
    }
    if (period === FREEGIVING_PERIOD_MONTH) {
      body.startDay = +startDay
      body.endDay = +endDay
    }
    if (target && target !== 'all') {
      body.target = +target
    }
    AjaxHandler.fetch(resource, body).then(json => {
      this.setState({
        checking: false
      })
      if (json && json.data) {
        if (json.data.result) {
          Noti.hintLock('操作出错', '当前学校已有赠送金额设置，请勿重复添加')
        } else if (callback) {
          callback()
        }
      }
    })
  }

  changeStartDay = v => {
    this.setState({
      startDay: v
    })
  }
  checkStartDay = v => {
    if (!v) {
      this.setState({
        startDayError: true
      })
    } else if (this.state.startDayError) {
      this.setState({
        startDayError: false
      })
    }
  }
  changeEndDay = v => {
    this.setState({
      endDay: v
    })
  }
  checkEndDay = v => {
    if (!v) {
      this.setState({
        endDayError: true
      })
    } else if (this.state.endDayError) {
      this.setState({
        endDayError: false
      })
    }
  }
  changeStartTime = v => {
    let startTime = v.valueOf()
    this.setState({ startTime })
  }
  changeEndTime = v => {
    let endTime = v.valueOf()
    this.setState({ endTime })
  }
  changeOnline = e => {
    const v = e.target.value
    if (v === FREEGIVING_ONLINE) {
      return
    }
    let nextState = {
      status: e.target.value,
      statusError: false
    }
    this.setState(nextState)
  }
  setOnline = () => {
    this.setState({
      status: 1,
      statusError: false
    })
  }
  changeValidateMonth = e => {
    const v = e.target.value
    this.setState({
      validateTimeOption: v
    })
  }
  render() {
    let {
      amount,
      amountError,
      period,
      periodError,
      startDay,
      startDayError,
      endDay,
      endDayError,

      schoolId,
      schoolError,

      startTime,
      endTime,
      status,
      released,
      initialSchool,
      schoolOpts,

      target,
      targetError,

      validateTimeOption,
      validateTimeOptionError,
      statusError
    } = this.state
    const startDaySelect = (
      <BasicSelectorWithoutAll
        disabled={released}
        className={released ? 'disabled' : ''}
        style={{ marginRight: '8px', width: '100px' }}
        staticOpts={MONTH_DAY_ENUMS}
        selectedOpt={startDay}
        changeOpt={this.changeStartDay}
        checkOpt={this.checkStartDay}
      />
    )
    const endDaySelect = (
      <BasicSelectorWithoutAll
        disabled={released}
        className={released ? 'disabled' : ''}
        style={{ marginRight: '8px', width: '100px' }}
        staticOpts={MONTH_DAY_ENUMS}
        selectedOpt={endDay}
        changeOpt={this.changeEndDay}
        checkOpt={this.checkEndDay}
      />
    )

    return (
      <div className="infoList">
        <ul>
          <li>
            <p>选择学校:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              disabled={initialSchool}
              className={initialSchool ? 'disabled' : ''}
              staticOpts={schoolOpts}
              selectedOpt={schoolId}
              changeOpt={this.changeSchool}
              checkOpt={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>赠送金额:</p>
            <input
              disabled={released}
              className={released ? 'disabled' : ''}
              type="number"
              value={amount}
              onChange={this.changeAmount}
              onBlur={this.checkAmount}
            />元
            {amountError ? (
              <span className="checkInvalid">赠送金额不能为空</span>
            ) : null}
          </li>
          <li>
            <p>赠送周期:</p>
            <BasicSelectorWithoutAll
              disabled={released}
              style={{ width: '80px' }}
              className={released ? 'disabled' : ''}
              staticOpts={FREEGIVING_PERIOD}
              selectedOpt={period}
              changeOpt={this.changePeriod}
              checkOpt={this.checkPeriod}
            />
            {periodError ? (
              <span className="checkInvalid">周期不能为空</span>
            ) : null}
          </li>
          <li>
            <p>赠送时间:</p>
            <span>
              {period === FREEGIVING_PERIOD_MONTH ? startDaySelect : null}
              <TimePicker
                disabled={released}
                style={{ width: 'auto', backgroundColor: 'auto' }}
                className={released ? 'timepicker disabled' : 'timepicker'}
                allowEmpty={false}
                showSecond={false}
                value={moment(startTime)}
                onChange={this.changeStartTime}
                format="HH:mm"
              />
              <span>执行赠送时间</span>
              {startDayError ? (
                <span className="checkInvalid">请选择开始日期</span>
              ) : null}
            </span>
          </li>
          <li>
            <p>清零余额时间:</p>
            <span>
              {period === FREEGIVING_PERIOD_MONTH ? endDaySelect : null}
              <TimePicker
                disabled={released}
                className={released ? 'timepicker disabled' : 'timepicker'}
                style={{ width: 'auto' }}
                allowEmpty={false}
                showSecond={false}
                value={moment(endTime)}
                onChange={this.changeEndTime}
                format="HH:mm"
              />
              <span>清零赠送金额时间</span>
              {endDayError ? (
                <span className="checkInvalid">请选择结束日期</span>
              ) : null}
            </span>
          </li>
          <li>
            <p>赠送对象:</p>
            <BasicSelectorWithoutAll
              disabled={released}
              className={released ? ' disabled' : ''}
              selectedOpt={target}
              staticOpts={FREEGIVING_TARGETS}
              changeOpt={this.changeTarget}
              checkOpt={this.checkTarget}
            />
            {targetError ? (
              <span className="checkInvalid">请选择赠送对象</span>
            ) : null}
          </li>
          <li>
            <p>生效时间：</p>
            <RadioGroup
              disabled={released}
              onChange={this.changeValidateMonth}
              value={validateTimeOption}
            >
              <Radio value={1}>
                {period === FREEGIVING_PERIOD_MONTH ? '当月' : '今日'}
              </Radio>
              <Radio value={2}>
                {period === FREEGIVING_PERIOD_MONTH ? '下月' : '明日'}
              </Radio>
            </RadioGroup>
            {validateTimeOptionError ? (
              <span className="checkInvalid">请选择生效时间！</span>
            ) : null}
          </li>
          <li>
            <p>是否上线：</p>
            <RadioGroup onChange={this.changeOnline} value={status}>
              <Popconfirm
                title="确定要上线么?"
                onConfirm={this.setOnline}
                okText="确认"
                cancelText="取消"
              >
                <Radio value={1}>是</Radio>
              </Popconfirm>
              <Radio value={2}>否</Radio>
            </RadioGroup>
            {released ? (
              <span className="checkInvalid">
                上线活动不能编辑，请您先将活动下线！
              </span>
            ) : null}
            {statusError ? (
              <span className="checkInvalid">请选择是否上线！</span>
            ) : null}
          </li>
          <li>
            <p />
            <span className="hintText">
              *设置后，该校所有用户都会赠送余额，赠送的余额用户不可提现，且会优先消费。
            </span>
          </li>
        </ul>

        <div className="btnArea">
          {status === FREEGIVING_ONLINE ? (
            <Popconfirm
              title="确定要上线么?"
              onConfirm={this.confirm}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          ) : (
            <Button type="primary" onClick={this.confirm}>
              确认
            </Button>
          )}
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default FreeGivingInfo
