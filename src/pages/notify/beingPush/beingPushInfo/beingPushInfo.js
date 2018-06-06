import React from 'react'
import moment from 'moment'
import 'rc-time-picker/assets/index.css'
import { Button, DatePicker } from 'antd'

import CONSTANTS from '../../../../constants'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../../component/basicSelectorWithoutAll'
// import AjaxHandler from '../../../../mock/ajax'
import AjaxHandler from '../../../../util/ajax'
import AddPlusAbs from '../../../component/addPlusAbs'
import { noticService } from '../../../service/index'
import Noti from '../../../../util/noti'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeNotify } from '../../../../actions/index'
const {
  BEINGS_PUSH_EQUMENT,
  BEING_PUSH_METHON,
  BEINGS_PUSH_PERSON,
  BEINGS_PUSH_TARGET_PERSON,
  BEING_PUSH_METNON_WAITE,
  PUSH_TYPE_PERSON
} = CONSTANTS
class BeingInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      schoolId: 'all',
      schoolError: false,
      methon: '',
      mobile: [''],
      env: 'all',
      target: '',
      planPushTime: moment(moment().add(5, 'minute')),
      content: '',
      status: 2,
      type: 2,
      emvError: false,
      contentError: false,
      methonError: false
    }
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      var data = this.props.location.state
      const body = {
        id: data.id,
        type: data.type
      }
      this.fetchData(body)
      this.setState({
        id: data.id
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  fetchData(body) {
    const resource = '/push/one'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        const {
          id,
          schoolId,
          mode,
          env,
          target,
          planPushTime,
          content
        } = json.data
        const nextState = {
          id,
          schoolId,
          methon: mode,
          env,
          target: target,
          planPushTime,
          content
        }
        this.setState(nextState)
      }
    })
  }
  cancel = () => {
    this.props.history.goBack()
  }
  changeState = (v, keyName) => {
    const nextState = {}
    nextState[keyName] = v
    this.setState(nextState)
  }
  checkState = (v, keyName, keyErrorName) => {
    const nextState = {}
    nextState[keyName] = v
    nextState[keyErrorName] = false
    if (v && v !== 'all') {
      return this.setState(nextState)
    }
    nextState[keyErrorName] = true
    this.setState(nextState)
  }
  addMobile = e => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile.push('')
    this.setState({
      mobile: mobile
    })
  }
  abstractMobile = e => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile.pop()
    this.setState({
      mobile: mobile
    })
  }
  changeMobile = (e, i) => {
    const mobile = JSON.parse(JSON.stringify(this.state.mobile))
    mobile[i] = e.target.value
    this.setState({
      mobile: mobile
    })
  }
  comleteEdit = () => {
    const {
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content
    } = this.state
    const body = {
      schoolId,
      mode: methon,
      env: env,
      range: target,
      content
    }
    if (!schoolId || schoolId === 'all') {
      return this.setState({
        schoolError: true
      })
    }
    if (!env || env === 'all') {
      return this.setState({
        envError: true
      })
    }
    if (!content.trim() || content.length > 50) {
      return this.setState({
        contentError: true
      })
    }
    if (!methon || methon === 'all') {
      return this.setState({
        methonError: true
      })
    }
    if (!target || target === 'all') {
      return this.setState({
        targetError: true
      })
    }
    const fiveMinute = moment().add(5, 'minute')
    if (fiveMinute > planPushTime) {
      return this.setState({
        TimeError: true
      })
    }

    if (parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON) {
      body.mobile = mobile
    }
    if (parseInt(methon, 10) === BEING_PUSH_METNON_WAITE) {
      body.planPushTime = planPushTime.valueOf()
    }
    this.addBeingInfo(body)
  }
  addBeingInfo = body => {
    const { id } = this.state
    this.props.changeNotify('type', {
      type: PUSH_TYPE_PERSON
    })
    if (id) {
      body.id = id
      noticService.upDatePush(body).then(json => {
        if (json && json.data) {
          Noti.hintSuccess(this.props.history, '/notify/beings')
        }
      })
    } else {
      noticService.addPush(body).then(json => {
        if (json && json.data) {
          Noti.hintSuccess(this.props.history, '/notify/beings')
        }
      })
    }
  }
  changeContent = event => {
    this.setState({
      content: event.target.value
    })
  }
  checkContent = event => {
    let value = event.target.value.trim()
    if (!value || value.length > 50) {
      this.setState({
        contentError: true
      })
    } else {
      this.setState({
        contentError: false
      })
    }
  }
  postEditData = () => {
    const {
      id,
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content
    } = this.state
    const body = {
      id,
      schoolId,
      methon,
      env: env,
      target,
      content
    }
    if (parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON) {
      body.mobile = mobile
    }
    if (parseInt(methon, 10) === BEING_PUSH_METNON_WAITE) {
      body.planPushTime = planPushTime
    }
    console.log(body, 'edit')
  }
  /**
   * 返回一个范围内的数组
   * @param {数组开始数字} start
   * @param {数组结束数字} end
   */
  range(start, end) {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }
  //只能选择当前时间五分钟以后的日期
  disabledDate(current) {
    const fiveMinute = moment().add(5, 'minute')
    var sBDay = moment(fiveMinute).subtract(1, 'days')
    return current < moment(sBDay).endOf('day')
  }
  //只能选择当前时间五分钟以后的时间
  disabledDateTime = current => {
    const fiveMinute = moment().add(5, 'minute')
    if (current.date() === moment(fiveMinute).date()) {
      const disableTime = {}
      disableTime.disabledHours = () => {
        return this.range(0, moment(fiveMinute).hours())
      }
      if (current.hours() === moment(fiveMinute).hours()) {
        disableTime.disabledMinutes = () => {
          return this.range(0, moment(fiveMinute).minutes())
        }
        if (current.minutes() === moment(fiveMinute).minutes()) {
          disableTime.disabledSeconds = () => {
            return this.range(0, moment(fiveMinute).seconds())
          }
        }
      }
      return disableTime
    }
  }
  changeTime = value => {
    const fiveMinute = moment().add(5, 'minute')
    if (fiveMinute > value) {
      this.setState({
        TimeError: true
      })
    } else {
      this.setState({
        TimeError: false,
        planPushTime: value
      })
    }
  }
  render() {
    let {
      schoolId,
      methon,
      mobile,
      env,
      target,
      planPushTime,
      content,
      contentError,
      schoolError,
      methonError,
      envError,
      targetError,
      TimeError
    } = this.state
    const mobileItems =
      mobile &&
      mobile.map((mobileItem, index) => {
        return (
          <li key={index}>
            <input
              placeholder="输入手机号"
              value={mobile[index]}
              onChange={e => {
                this.changeMobile(e, index)
              }}
            />
          </li>
        )
      })
    return (
      <div className="infoList notifyInfo">
        <ul>
          <li>
            <p>学校名称:</p>
            <SchoolSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={schoolId}
              changeSchool={v => {
                this.changeState(v, 'schoolId')
              }}
              checkSchool={v => {
                this.checkState(v, 'schoolId', 'schoolError')
              }}
            />
            {schoolError ? (
              <span className="checkInvalid">请选择学校</span>
            ) : null}
          </li>
          <li>
            <p>推送环境:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_EQUMENT}
              width={150}
              selectedOpt={env}
              changeOpt={v => {
                this.changeState(v, 'env')
              }}
              invalidTitle="选择类型"
              checkOpt={v => {
                this.checkState(v, 'env', 'envError')
              }}
            />
            {envError ? (
              <span className="checkInvalid">请选择推送环境</span>
            ) : null}
          </li>
          <li className="itemsWrapper high">
            <p>推送内容:</p>
            <div>
              <textarea
                value={content}
                onBlur={this.checkContent}
                onChange={this.changeContent}
              />
              {contentError ? (
                <span className="checkInvalid">公告内容为0～50字！</span>
              ) : null}
            </div>
          </li>
          <li>
            <p>推送方式:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEING_PUSH_METHON}
              width={150}
              selectedOpt={methon}
              changeOpt={v => {
                this.changeState(v, 'methon')
              }}
              checkOpt={v => {
                this.checkState(v, 'methon', 'methonError')
              }}
              invalidTitle="选择推送方式"
            />
            {methonError ? (
              <span className="checkInvalid">请选择推送方式</span>
            ) : null}
          </li>
          {parseInt(methon, 10) === BEING_PUSH_METNON_WAITE ? (
            <li>
              <p>推送时间:</p>
              <DatePicker
                className="datePicker "
                style={{ height: '30px', width: 'auto' }}
                disabledDate={this.disabledDate}
                disabledTime={this.disabledDateTime}
                showTime
                allowClear={false}
                value={moment(planPushTime)}
                onChange={this.changeTime}
                format="YYYY-MM-DD HH:mm:ss"
              />
              {TimeError ? (
                <span className="checkInvalid">
                  指定推送时间需晚于当前时间五分钟
                </span>
              ) : null}
            </li>
          ) : null}

          <li>
            <p>推送对象:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_PERSON}
              width={150}
              selectedOpt={target}
              changeOpt={v => {
                this.changeState(v, 'target')
              }}
              invalidTitle="选择推送对象"
              checkOpt={v => {
                this.checkState(v, 'target', 'targetError')
              }}
            />
            {targetError ? (
              <span className="checkInvalid">请选择推送方式</span>
            ) : null}
          </li>
          {parseInt(target, 10) === BEINGS_PUSH_TARGET_PERSON ? (
            <li className="itemsWrapper">
              <p>用户手机:</p>
              <div>
                <ul>{mobileItems}</ul>
                <AddPlusAbs
                  count={mobile.length}
                  add={this.addMobile}
                  abstract={this.abstractMobile}
                />
              </div>
            </li>
          ) : null}
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.comleteEdit}>
            确定
          </Button>
          <Button onClick={this.cancel}>返回</Button>
        </div>
      </div>
    )
  }
}
export default withRouter(connect(null, { changeNotify })(BeingInfo))
