import React from 'react'
import { Button, Popconfirm, Radio } from 'antd'
import { Link } from 'react-router-dom'
import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import Format from '../../../util/format'
import CONSTANTS from '../../../constants'
import { mul } from '../../../util/numberHandle'
const {
  DEVICE_TYPE_BLOWER,
  DEVICE_TYPE_WASHER,
  BUSI_TYPE_ENTRANCE,
  DEVICE_TYPE_HEATER,
  WASHER_RATE_TYPES,
  REAL_SCHOOL,
  TEST_SCHOOL,
  SCHOOL_TYPES,
  // DEVICE_AGREEMENT_B,
  DOORFORBID_WEEK
} = CONSTANTS

const RadioGroup = Radio.Group
const BUSINESS = CONSTANTS.BUSINESS

/**
 * use 'finished', 'status', 'onlineChanged' to determine status.
 * 'finished' is fetched from server to determine if the info is all ready
 * 'status' is used to indicate user select online or offline on page
 * 'onlineChange' is set to true when user changed 'status'
 */
class InfoSet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      leftModal: true,
      loading: true,
      percent: '0%',
      schoolId: 0,
      schoolName: '',
      buildingNames: [],
      buildingNamesSet: false,
      businesses: [],
      businessSet: false,
      prepayFunction: null,
      prepayFunctionSet: false,
      prepayOptions: [],
      prepayOptionsSet: false,
      waterTimeRanges: null,
      waterTimeRangeSet: false,
      repairCauses: [],
      repairCausesSet: false,
      rechargeAmount: [],
      rechargeAmountsSet: false,
      bonusActivity: '',
      bonusActivitySet: false,
      repairmans: [],
      repairmansSet: false,
      finished: false,
      finishError: false,
      onlineChanged: false,
      status: '',
      rateDetails: [],
      gateTime: {},
      rateDetailsSet: false,
      prepayNotMatchBusiness: false,
      rateNotMatchBusiness: false,
      type: '',
      typeError: false,
      suppliers: {}
    }
  }
  fetchData = body => {
    let resource = '/school/basicConfig'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          let {
            schoolName,
            gateTime,
            buildingNames,
            businesses,
            prepayFunction,
            prepayOptions,
            waterTimeRanges,
            repairCauses,
            rechargeAmount,
            bonusActivity,
            repairmans,
            finished,
            status,
            rateDetails,
            type
          } = json.data
          nextState.schoolName = schoolName
          nextState.type = type ? type : ''
          nextState.buildingNamesSet = buildingNames ? true : false
          if (buildingNames) {
            nextState.buildingNames = buildingNames
          }
          nextState.businessSet = businesses ? true : false
          if (businesses) {
            /* 
              1.  添加学校时，  洗衣机和门禁没有预付选项
              2.  添加学校时，  门禁没有费率
            */
            nextState.businesses = businesses
            businesses.forEach(busi => {
              if (busi === BUSI_TYPE_ENTRANCE) {
                return
              }
              let rateSet =
                rateDetails &&
                rateDetails.some(rate => {
                  return rate.deviceType === busi
                })
              if (!rateSet) {
                nextState.rateNotMatchBusiness = true
              }
              // if washer, ignore it
              if (busi === DEVICE_TYPE_WASHER) {
                return
              }
              let prepaySet =
                prepayOptions &&
                prepayOptions.some(prepay => prepay.deviceType === busi)
              if (!prepaySet) {
                nextState.prepayNotMatchBusiness = true
              }
            })
          }
          nextState.prepayFunctionSet = prepayFunction ? true : false
          if (prepayFunction) {
            nextState.prepayFunction = prepayFunction
          }
          nextState.prepayOptionsSet = prepayOptions ? true : false
          if (prepayOptions) {
            nextState.prepayOptions = prepayOptions
          }
          nextState.waterTimeRangeSet =
            waterTimeRanges && waterTimeRanges.length > 0 ? true : false
          if (waterTimeRanges) {
            nextState.waterTimeRanges = waterTimeRanges
          }
          nextState.repairCausesSet = repairCauses ? true : false
          if (repairCauses) {
            nextState.repairCauses = repairCauses
          }
          nextState.rechargeAmountsSet = rechargeAmount ? true : false
          if (rechargeAmount) {
            nextState.rechargeAmount = rechargeAmount
          }
          nextState.bonusActivitySet = bonusActivity ? true : false
          if (bonusActivity) {
            nextState.bonusActivity = bonusActivity
          }
          nextState.repairmansSet = repairmans ? true : false
          if (repairmans) {
            nextState.repairmans = repairmans
          }
          nextState.rateDetailsSet = rateDetails ? true : false
          if (rateDetails) {
            nextState.rateDetails = rateDetails
          }
          if (gateTime) {
            nextState.gateTime = gateTime
          }
          nextState.finished = finished
          nextState.status = status
          this.setState(nextState)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    let data = this.props.location.state
    let { id, percent } = data
    id = parseInt(id, 10)
    this.setState({
      schoolId: id,
      percent: percent
    })
    const body = {
      id: id
    }
    this.setState({
      loading: true
    })
    this.fetchData(body)
    // this.fetchSchoolInfo(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  confirm = () => {
    let { finished, type } = this.state
    if (!finished) {
      Noti.hintAndClick('请求出错', '当前学校还未设置完必选项，请全部添加后再')
      return
    }
    if (!type) {
      return this.setState({
        typeError: true
      })
    }
    this.postChange()
  }
  postChange = () => {
    let { status, finished, type } = this.state
    if (!finished) {
      return
    }
    if (!status) {
      return
    }
    let resource
    if (status && status === 1) {
      resource = '/school/online'
    } else {
      resource = '/school/offline'
    }
    const body = {
      id: parseInt(this.state.schoolId, 10),
      type: parseInt(type, 10)
    }
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintSuccess(this.props.history, '/school/list')
        } else {
          Noti.hintLock('请求出错', '请稍后重试')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  back = () => {
    this.props.history.goBack()
  }
  toBuildingSet = e => {
    let schoolId = this.state.schoolId
    this.props.history.push({
      pathname: `/school/list/blockManage/:${schoolId}`,
      state: { path: 'fromInfoSet' }
    })
  }
  toBusinessSet = e => {
    let schoolId = this.state.schoolId
    this.props.history.push({
      pathname: `/school/list/business/:${schoolId}`,
      state: { path: 'fromInfoSet' }
    })
  }
  toPrepayFunctionSet = e => {
    this.props.history.push({
      pathname: `/device/price/addPrice`,
      state: { path: 'fromInfoSet' }
    })
  }
  toPrepayOptionSet = e => {
    this.props.history.push({
      pathname: `/device/prepay/addPrepay`,
      state: { path: 'fromInfoSet' }
    })
  }
  toWaterTimeRangeSet = e => {
    this.props.history.push({
      pathname: `/device/timeset/addTimeset`,
      state: { path: 'fromInfoSet' }
    })
  }
  toBunusActSet = e => {
    this.props.history.push({
      pathname: `/gift/act/addAct`,
      state: { path: 'fromInfoSet' }
    })
  }
  toRepairmanSet = e => {
    this.props.history.push({
      pathname: `/employee`,
      state: { path: 'fromInfoSet' }
    })
  }
  toRechargeSet = e => {
    this.props.history.push({
      pathname: `/fund/charge/addCharge`,
      state: { path: 'fromInfoSet' }
    })
  }
  toRateSet = e => {
    this.props.history.push({
      pathname: `/device/rateSet/addRate`,
      state: { path: 'fromInfoSet' }
    })
  }
  online = e => {
    this.setState({
      status: 1,
      onlineChanged: true // 修改过之后'确认'按钮出现
    })
  }
  offline = e => {
    this.setState({
      status: 2,
      onlineChanged: true
    })
  }
  cancel = e => {
    // nothing
  }
  changeType = e => {
    this.setState({
      type: e.target.value,
      typeError: false
    })
  }

  render() {
    let {
      // suppliers,
      schoolId,
      percent,
      schoolName,
      buildingNames,
      buildingNamesSet,
      businesses,
      businessSet,
      prepayOptions,
      waterTimeRanges,
      waterTimeRangeSet,
      rechargeAmount,
      rechargeAmountsSet,
      bonusActivity,
      bonusActivitySet,
      repairmans,
      repairmansSet,
      finished,
      finishError,
      onlineChanged,
      status,
      gateTime,
      rateDetails,
      type,
      typeError
    } = this.state
    const star = <span className="red">*</span>
    let building =
      buildingNames &&
      buildingNames.map((r, i) => (
        <span className="inlineItem" key={`building${i}`}>
          {r.fullName}
        </span>
      ))
    let businessContent =
      businessSet &&
      businesses.map((r, i) => (
        <span className="inlineItem" key={`business${i}`}>
          {BUSINESS[r]}
        </span>
      ))
    let getEquipmentModal = modal => {
      console.log(equipment)
      let isShow = true
      let contact = null

      contact = []
      for (let index in equipment) {
        let record = equipment[index]
        let addRateItem = (
          <Link
            className="mgl15"
            key={`addRateItem${index}`}
            to={{
              pathname: `/device/rateSet/addRate`,
              state: { path: 'fromInfoSet' }
            }}
          >
            前往设置
          </Link>
        )
        if (parseInt(index, 10) !== BUSI_TYPE_ENTRANCE) {
          if (record.rateDetail) {
            isShow = !isShow
            if (isShow === modal) {
              let deviceRate =
                record.rateDetail[0] &&
                record.rateDetail.map((value, indexNum) => {
                  let deviceRateContent
                  let seeDetial = (
                    <Link
                      className="mgl15"
                      key={`rateItem${indexNum}`}
                      to={{
                        pathname: `/device/rateSet/rateInfo/:${value.id}`,
                        state: { path: 'fromInfoSet' }
                      }}
                    >
                      前往设置
                    </Link>
                  )

                  if (parseInt(value.deviceType, 10) === DEVICE_TYPE_WASHER) {
                    deviceRateContent =
                      value.rateGroups &&
                      value.rateGroups.map((r, i) => (
                        <span key={`rateDetail${i}`}>
                          {`${WASHER_RATE_TYPES[r.pulse]}/${
                            r.price ? r.price : ''
                          }元、`}
                          {i + 1 === value.rateGroups.length
                            ? `(${
                                value.supplierName
                                  ? value.supplierName
                                  : '无数据'
                              })`
                            : ''}
                        </span>
                      ))
                  } else {
                    let denomination =
                      parseInt(value.deviceType, 10) === DEVICE_TYPE_BLOWER
                        ? '秒'
                        : '脉冲'
                    deviceRateContent =
                      value.rateGroups &&
                      value.rateGroups.map((r, i) => (
                        <span key={i}>
                          {r.unitPulse
                            ? `1升水/${r.unitPulse}${denomination}、`
                            : ''}
                          {mul(r.price, 100)}分/{r.pulse}
                          {denomination}
                          {i + 1 === value.rateGroups.length ||
                          i % 2 === 1 ||
                          r.unitPulse
                            ? `(${
                                value.supplierName
                                  ? value.supplierName
                                  : '无数据'
                              })`
                            : '、'}
                          {i % 2 === 1 || r.unitPulse ? <br /> : ''}
                        </span>
                      ))
                  }
                  return (
                    <div className="deviceItem" key={`deviceItem${indexNum}`}>
                      <div className="deviceRateContent">
                        {deviceRateContent}
                      </div>
                      {seeDetial}
                    </div>
                  )
                })
              let waterContents = null
              if (record.waterTimeRange) {
                if (
                  parseInt(record.waterTimeRange.deviceType, 10) ===
                  DEVICE_TYPE_HEATER
                ) {
                  let items = record.waterTimeRange.items
                  let timeItem =
                    items &&
                    items.map((r, i) => (
                      <span key={i} className="inlineItem">
                        {Format.adding0(r.startTime.hour)}:{Format.adding0(
                          r.startTime.minute
                        )}~{Format.adding0(r.endTime.hour)}:{Format.adding0(
                          r.endTime.minute
                        )}
                      </span>
                    ))
                  waterContents = record.waterTimeRange ? (
                    <div>
                      <span className="itemTitle">供水时段</span>
                      <span className="itemContent">{timeItem}</span>
                      <Link
                        className="mgl15"
                        key={`innerwtitem${index}`}
                        to={{
                          pathname: `/device/timeset/editTimeset/:${
                            record.waterTimeRange.id
                          }`,
                          state: { path: 'fromInfoSet' }
                        }}
                      >
                        前往设置
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <span className="itemTitle">供水时段</span>
                      <span className="itemContent">
                        <span>未设置即全天供应热水</span>
                      </span>
                      <Link
                        className="mgl15"
                        key={`innerwtitem${index}`}
                        to={{
                          pathname: `/device/timeset/addTimeset`,
                          state: { path: 'fromInfoSet' }
                        }}
                      >
                        前往设置
                      </Link>
                    </div>
                  )
                }
              }
              let contactItem = (
                <li key={`other${index}`} className="equment">
                  <div className="deviceName">
                    {CONSTANTS.DEVICETYPE[record.deviceType]}设置
                  </div>
                  <div>
                    <span className="itemTitle">{star}预付选项</span>
                    {record.prepayOption ? (
                      <span className="itemContent">
                        <span key={`prepay${index}`}>
                          预付¥{record.prepayOption.prepay}
                        </span>
                        <span key={`minpay${index}`}>
                          最低¥{record.prepayOption.minPrepay}
                        </span>
                        <Link
                          className="mgl15"
                          to={{
                            pathname: `/device/prepay/editPrepay/:${
                              record.prepayOption.id
                            }`,
                            state: { path: 'fromInfoSet' }
                          }}
                        >
                          前往设置
                        </Link>
                      </span>
                    ) : (
                      <span className="red itemContent">
                        请前往设置<Link
                          className="mgl15"
                          to={{
                            pathname: `/device/prepay/addPrepay`,
                            state: { path: 'fromInfoSet' }
                          }}
                        >
                          前往添加
                        </Link>
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="itemTitle">{star}设备费率</span>
                    <span className="itemContent">
                      {record.unitPrice ? (
                        <div className="deviceItem">{`设备水量单价：${
                          record.rateDetail[0].unitPrice
                        }元/升`}</div>
                      ) : null}
                      {deviceRate ? deviceRate : addRateItem}
                    </span>
                  </div>
                  {waterContents}
                </li>
              )
              contact.push(contactItem)
            }
          }
        } else {
          let contactItem = (
            <li key={`other${index}`} className="equment">
              <div className="deviceName">
                {CONSTANTS.BUSINESS[record.deviceType]}设置
              </div>
              <div>
                <span className="itemTitle">{star}归寝时间</span>
                {record.gateTime ? (
                  <span className="itemContent">{record.gateTime}</span>
                ) : (
                  <span className="red itemContent">无</span>
                )}
              </div>
            </li>
          )
          contact.push(contactItem)
        }
      }

      return contact
    }
    let equipment = {}
    businesses.forEach((value, index) => {
      equipment[value] = {
        deviceType: value,
        rateDetail: [],
        unitPrice: '',
        waterTimeRange: null,
        prepayOption: {},
        entranceTime: null
      }
    })
    prepayOptions.forEach((record, index) => {
      if (equipment[record.deviceType]) {
        equipment[record.deviceType]['prepayOption'] = record
      }
    })
    rateDetails.forEach((record, index) => {
      if (equipment[record.deviceType]) {
        equipment[record.deviceType]['rateDetail'].push(record)
        equipment[record.deviceType]['unitPrice'] = equipment[
          record.deviceType
        ]['unitPrice']
          ? equipment[record.deviceType]['unitPrice']
          : record.unitPrice
      }
    })
    if (waterTimeRangeSet) {
      waterTimeRanges.forEach((record, index) => {
        if (equipment[record.deviceType]) {
          equipment[record.deviceType]['waterTimeRange'] = record
        }
      })
    }
    if (equipment[BUSI_TYPE_ENTRANCE]) {
      if (gateTime.items) {
        let entranceTime = gateTime.items.map((r, index) => {
          let subItems = r.items
          let timeTipString = ''
          subItems.forEach(value => {
            var day = value.day
            if (timeTipString === '') {
              timeTipString += DOORFORBID_WEEK[day]
            } else {
              timeTipString += `、${DOORFORBID_WEEK[day]}`
            }
          })
          let lateString = Format.minIntToHourMinStr(r.items[0].lateTime)
          let notReturnString = Format.minIntToHourMinStr(
            r.items[0].notReturnTime
          )
          let subTitle = `正常归寝: ${lateString}以前、晚归: ${lateString}~${notReturnString}、未归: ${notReturnString}以后`
          return (
            <p key={`entranceItem${index}`} className="entranceItem">
              {timeTipString}:{subTitle}
            </p>
          )
        })
        equipment[BUSI_TYPE_ENTRANCE].gateTime = entranceTime
      }
    }
    let equipmentsContent = getEquipmentModal(false)
    let equipmentsContentRight = getEquipmentModal(true)
    let repairmansContent =
      repairmansSet &&
      repairmans.map((record, index) => (
        <span className="inlineItem" key={`repairman${index}`}>
          {record}
        </span>
      ))
    let rechargeAmountsContent =
      rechargeAmountsSet &&
      rechargeAmount.items.map((record, index) => (
        <span className="inlineItem" key={`recharge${index}`}>
          {record}
        </span>
      ))
    return (
      <div className="infoList infoSetInfo">
        <ul>
          <li className="schoolName">
            {schoolName}
            <span>
              （信息完整度{percent}
              {status === 1 ? '已上线' : '未上线'}）
            </span>
          </li>
          <li>
            <p>{star}已添加楼栋:</p>
            {buildingNamesSet ? <span>{building}</span> : null}
            {buildingNamesSet ? (
              <Link
                className="mgl15"
                to={{
                  pathname: `/school/list/blockManage/:${schoolId}`,
                  state: { path: 'fromInfoSet' }
                }}
              >
                查看详情
              </Link>
            ) : (
              <Button onClick={this.toBuildingSet} type="primary">
                前往设置
              </Button>
            )}
          </li>
          <li className="userEnter">
            <p>{star}用户端功能入口:</p>
            {businessSet ? <span>{businessContent}</span> : null}
            {businessSet ? (
              <Link
                className="mgl15"
                to={{
                  pathname: `/school/list/business/:${schoolId}`,
                  state: { path: 'fromInfoSet' }
                }}
              >
                {businessSet ? '查看详情' : '前往设置'}
              </Link>
            ) : (
              <Button onClick={this.toBusinessSet} type="primary">
                前往设置
              </Button>
            )}
          </li>
          <div className="leftModal">
            {equipmentsContent ? equipmentsContent : null}
            {/* {equipment.length % 2 === 1 && entranceContent
              ? entranceContent
              : null} */}
          </div>
          <div className="rightModal">
            {equipmentsContentRight ? equipmentsContentRight : null}
            {/* {equipment.length % 2 !== 1 && entranceContent
              ? entranceContent
              : null} */}
          </div>
          <li className="moneySet">
            <p>{star}充值面额设置:</p>
            {rechargeAmountsSet ? <span>{rechargeAmountsContent}</span> : null}
            {rechargeAmountsSet ? (
              <Link
                className="mgl15"
                to={{
                  pathname: `/fund/charge/editCharge/:${
                    rechargeAmount.schoolId
                  }`,
                  state: { path: 'fromInfoSet' }
                }}
              >
                查看详情
              </Link>
            ) : (
              <Button onClick={this.toRechargeSet} type="primary">
                前往添加
              </Button>
            )}
          </li>
          <li>
            <p>新人红包活动:</p>
            {bonusActivitySet ? '已有新人红包活动' : null}
            {bonusActivitySet ? (
              <Link
                className="mgl15"
                to={{
                  pathname: `/gift/act/actInfo/:${bonusActivity}`,
                  state: { path: 'fromInfoSet' }
                }}
              >
                查看详情
              </Link>
            ) : (
              <Button onClick={this.toBunusActSet} type="primary">
                前往添加
              </Button>
            )}
          </li>
          <li>
            <p>维修员:</p>
            {repairmansSet ? (
              <span className="longItem">{repairmansContent}</span>
            ) : (
              <Button type="primary" onClick={this.toRepairmanSet}>
                前往添加
              </Button>
            )}
          </li>
          {/* show this when need to change online */}
          {finished ? (
            <li>
              <p>{star}学校类型</p>
              {status === 1 && !onlineChanged ? (
                <span>{SCHOOL_TYPES[type] || '未知'}</span>
              ) : (
                <RadioGroup value={type} onChange={this.changeType}>
                  <Radio value={REAL_SCHOOL}>真实学校</Radio>
                  <Radio value={TEST_SCHOOL}>测试学校</Radio>
                </RadioGroup>
              )}
              {typeError ? (
                <span className="checkInvalid">请选择学校类型!</span>
              ) : null}
            </li>
          ) : null}
          {finished ? (
            <li>
              <p>是否上线：</p>
              <RadioGroup value={status}>
                <Popconfirm
                  title="确定要上线么?"
                  onConfirm={this.online}
                  onCancel={this.cancel}
                  okText="确认"
                  cancelText="取消"
                >
                  <Radio value={1}>是</Radio>
                </Popconfirm>
                <Popconfirm
                  title="确定要下线么?"
                  onConfirm={this.offline}
                  onCancel={this.cancel}
                  okText="确认"
                  cancelText="取消"
                >
                  <Radio value={2}>否</Radio>
                </Popconfirm>
              </RadioGroup>
              {finishError ? (
                <span className="checkInvalid  errorHint">
                  未设置完必选设置的学校不能上线～
                </span>
              ) : null}
            </li>
          ) : null}
        </ul>
        <div className="warn-text">
          打{star}的选项设置完成后，该学校才可正常上线
        </div>
        <div className="btnArea">
          {onlineChanged && finished ? (
            <Popconfirm
              title="确定要提交么?"
              onConfirm={this.confirm}
              onCancel={this.cancel}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          ) : null}
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default InfoSet
