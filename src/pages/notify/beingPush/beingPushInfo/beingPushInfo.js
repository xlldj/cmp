import React from 'react'
import moment from 'moment'
import 'rc-time-picker/assets/index.css'
import { Button, DatePicker } from 'antd'

import CONSTANTS from '../../../../constants'
import SchoolSelector from '../../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../../component/basicSelectorWithoutAll'
import AjaxHandler from '../../../../mock/ajax'
import AddPlusAbs from '../../../component/addPlusAbs'
import { noticService } from '../../../service/index'
import { rePushList } from '../controller'
import Noti from '../../../../util/noti'
// import { connect } from 'react-redux'
// import { withRouter } from 'react-router-dom'
const {
  BEINGS_PUSH_EQUMENT,
  BEING_PUSH_METHON,
  BEINGS_PUSH_PERSON,
  BEINGS_PUSH_TARGET_PERSON,
  BEING_PUSH_METNON_WAITE
} = CONSTANTS
class BeingInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      schoolId: 'all',
      methon: '',
      mobile: [''],
      env: '',
      target: '',
      planPushTime: moment(moment().add(5, 'minute')),
      content: '',
      status: 2
    }
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body = {
        id: id
      }
      this.fetchData(body)
      this.setState({
        id: id
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  fetchData(body) {
    const resource = '/push/one'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          const {
            id,
            schoolId,
            methon,
            mobile,
            env,
            target,
            planPushTime,
            content
          } = json.data.detail
          const nextState = {
            id,
            schoolId,
            methon,
            mobile: mobile.length ? mobile : [''],
            env,
            target,
            planPushTime,
            content
          }
          this.setState(nextState)
        }
      }
    })
  }
  cancel = () => {
    this.props.history.goBack()
  }
  changeSchool = v => {
    this.setState({
      schoolId: v
    })
  }
  changeEqument = v => {
    this.setState({
      env: v
    })
  }
  changeMethon = v => {
    this.setState({
      methon: v
    })
  }
  changeObject = v => {
    this.setState({
      target: v
    })
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
    this.addBeingInfo(body)
  }
  addBeingInfo = body => {
    const { id } = this.state
    if (id) {
      body.id = id
      noticService.upDatePush(body).then(json => {
        if (json.data) {
          if (json.data.result) {
            Noti.hintOk('操作成功', '编辑成功')
            rePushList()
          } else {
            Noti.hintLock('操作失败', json.data.failReason)
          }
        }
      })
    } else {
      noticService.addPush(body).then(json => {
        if (json.data) {
          if (json.data.result) {
            Noti.hintOk('操作成功', '创建成功')
            rePushList()
          } else {
            Noti.hintLock('操作失败', json.data.failReason)
          }
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
    const value = event.target.value
    if (!value || value.length > 50) {
      this.setState({
        contentError: true,
        content: value
      })
    } else {
      this.setState({
        contentError: false,
        content: value
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
      }
      return disableTime
    }
  }
  changeTime = value => {
    this.setState({
      planPushTime: value
    })
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
      contentError
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
              changeSchool={this.changeSchool}
            />
          </li>
          <li>
            <p>推送环境:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_EQUMENT}
              width={150}
              selectedOpt={env}
              changeOpt={this.changeEqument}
              invalidTitle="选择类型"
            />
            {/* {typeError ? (
              <span className="checkInvalid">公告类型不能为空！</span>
            ) : null} */}
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
              changeOpt={this.changeMethon}
              invalidTitle="选择推送方式"
            />
          </li>
          {parseInt(methon, 10) === BEING_PUSH_METNON_WAITE ? (
            <li>
              <p>推送时间:</p>
              <DatePicker
                className="datePicker"
                style={{ height: '30px', width: 'auto' }}
                disabledDate={this.disabledDate}
                disabledTime={this.disabledDateTime}
                // showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                showTime
                allowClear={false}
                value={moment(planPushTime)}
                onChange={this.changeTime}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </li>
          ) : null}

          <li>
            <p>推送对象:</p>
            <BasicSelectorWithoutAll
              staticOpts={BEINGS_PUSH_PERSON}
              width={150}
              selectedOpt={target}
              changeOpt={this.changeObject}
              invalidTitle="选择推送对象"
            />
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

export default BeingInfo
