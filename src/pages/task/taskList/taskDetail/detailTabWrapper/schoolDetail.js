import React from 'react'
import Format from '../../../../../util/format'
import { schoolService } from '../../../../service/index'
import CONSTANTS from '../../../../../constants/index'
import Time from '../../../../../util/time'
class SchoolDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    const { schoolId } = this.props
    const body = {
      id: schoolId,
      page: 1,
      size: 1
    }
    this.fetchData(body)
  }
  fetchData(body) {
    schoolService.getOverviewList(body).then(json => {
      if (json.data) {
        if (json.data.schools) {
          this.constructorData(json.data.schools[0])
        }
      }
    })
  }
  constructorData(data) {
    const {
      devices = [],
      bonusActivity,
      depositActivity,
      withdrawTimeRange,
      notify
    } = data
    devices.forEach((device, index) => {
      if (device.waterTimeRange) {
        this.setState({
          waterTimeRange: device.waterTimeRange
        })
        return
      }
    })
    this.setState({
      bonusActivity,
      depositActivity,
      withdrawTimeRange,
      notify
    })
  }
  getDepositAct() {
    const { depositActivity } = this.state
    let act = depositActivity,
      str
    if (!act) {
      return <span>暂无</span>
    }
    if (act.type === 1) {
      str =
        act.items &&
        act.items.map((r, i) => {
          return (
            <p key={`real-${i}`}>
              {r.denomination}元面额实际充值{r.realAmount}元
            </p>
          )
        })
    } else {
      str =
        act.items &&
        act.items.map((r, i) => {
          let gifts =
            r.gifts &&
            r.gifts.map((rec, ind) => {
              return `${rec.value}元红包,`
            })
          return (
            <p key={`gift-${i}`}>
              充值{r.denomination}元送{gifts}
            </p>
          )
        })
    }
    return str
  }
  getTimeRange() {
    const { withdrawTimeRange } = this.state
    let record = withdrawTimeRange,
      result
    if (!record) {
      result = <span>暂无</span>
    } else if (record.type === 1) {
      result = (
        <span>
          每周{CONSTANTS.WEEKDAYS[record.fixedTime.startTime.weekday]}
          {Format.hourMinute(record.fixedTime.startTime.time)}~每周{
            CONSTANTS.WEEKDAYS[record.fixedTime.endTime.weekday]
          }
          {Format.hourMinute(record.fixedTime.endTime.time)}
        </span>
      )
    } else {
      result = (
        <span>
          {Time.getDayFormat(record.specificTime.startTime)}~{Time.getDayFormat(
            record.specificTime.endTime
          )}
        </span>
      )
    }
    return result
  }
  getBonusAct() {
    const { bonusActivity } = this.state
    if (!bonusActivity) {
      return <span>暂无</span>
    }
    let bonus =
      bonusActivity &&
      bonusActivity.map((r, i) => {
        let gifts =
          bonusActivity.gifts &&
          bonusActivity.gifts.map((r, i) => (
            <span key={`giftName-${i}`}>{r.amount}元红包/</span>
          ))
        return (
          <div key={`bonus-${i}`}>
            <span key={`bonusType-${i}`}>{CONSTANTS.BONUSACTTYPE[r.type]}</span>
            <span key={`bonusNameRelease-${i}`}>
              ({gifts}
              {CONSTANTS.RELEASEMETHOD[r.releaseMethod]},
            </span>
            <span key={`bonusEndTime-${i}`}>
              截止日期{Time.getDayFormat(r.endTime)})
            </span>
          </div>
        )
      })
    return bonus
  }
  render() {
    const { waterTimeRange, notify } = this.state
    let waterTimeItems =
      waterTimeRange &&
      waterTimeRange.items &&
      waterTimeRange.items.map((range, index) => Format.rangeToHour(range))
    const waterTimeStr = waterTimeItems && waterTimeItems.join('、')
    return (
      <ul className="detailList schoolDetail">
        <li>
          <label>供水时段:</label>
          <span>{waterTimeItems ? waterTimeStr : '暂无'}</span>
        </li>
        <li>
          <label>充值活动:</label>
          <div>{this.getDepositAct()}</div>
        </li>
        <li>
          <label>提现时间:</label>
          <div>{this.getTimeRange()}</div>
        </li>
        <li>
          <label>积分兑换:</label>
          <div> {this.getBonusAct()}</div>
        </li>
        <li>
          <label>当前公告:</label>
          <div> {notify ? notify : '暂无'}</div>
        </li>
      </ul>
    )
  }
}
export default SchoolDetail
