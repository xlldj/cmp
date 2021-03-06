import React, { Fragment } from 'react'
import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'
import moment from '../../../../util/myMoment'
import { Button } from 'antd'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import CONSTANTS from '../../../../constants'
import MultiSelectModal from '../../../component/multiSelectModal'
import Noti from '../../../../util/noti'
import { cloneDeep } from 'lodash'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid } from '../../../../actions'

import {
  fetchSaveSchollTimeRange,
  checkSchoolTimeRangeExist,
  fetchDoorFobidSchoolSettingList
} from '../../action'

import '../../style/style.css'

const subModule = 'backDormRecord'
const { SELECTWIDTH, DOORFORBID_WEEK } = CONSTANTS
class BackDormSettingInfo extends React.Component {
  constructor(props) {
    super(props)
    let defaultItems = this.defaultItemsMap()
    this.state = {
      schoolId: '',
      lastChooseSchoolId: '',
      schoolError: false,
      currentUnselectedTimeRanges: this.timeRangeWeekData,
      addButtonShow: true,
      allSelectedItems: [defaultItems]
    }
    this.timeRangeColumns = [
      {
        title: '时间',
        dataIndex: 'value',
        width: '75%'
      }
    ]
    this.timeRangeWeekData = [
      { value: '周一', selected: false },
      { value: '周二', selected: false },
      { value: '周三', selected: false },
      { value: '周四', selected: false },
      { value: '周五', selected: false },
      { value: '周六', selected: false },
      { value: '周日', selected: false }
    ]
  }

  defaultItemsMap = e => {
    return {
      lateTime: 600,
      notReturnTime: 60,
      timeRangeString: '',
      dayList: [], //[周一、周二]
      groupNo: 1,
      isSelected: false,
      notReturnTimeError: false
    }
  }

  componentDidMount() {
    if (this.props.location.state) {
      var editItemMap = this.props.location.state.editItem

      var items = editItemMap.items
      var editSelectedItems = []
      var hasSelectDayCount = 0 //选中的天数

      items.forEach(item => {
        var subDayList = []
        var itemMap = {}
        var timeTipString = ''
        var subItems = item.items
        subItems.forEach(subItem => {
          hasSelectDayCount++
          var dayTitle = DOORFORBID_WEEK[subItem.day]
          subDayList.push(dayTitle)
          if (timeTipString === '') {
            timeTipString += dayTitle
          } else {
            timeTipString += '、' + dayTitle
          }
        })
        itemMap.dayList = subDayList
        itemMap.lateTime = item.items[0].lateTime
        itemMap.notReturnTime = item.items[0].notReturnTime
        itemMap.groupNo = item.items[0].groupNo
        itemMap.timeRangeString = timeTipString
        editSelectedItems.push(itemMap)
      })

      this.setState({
        schoolId: editItemMap.schoolId,
        allSelectedItems: editSelectedItems,
        addButtonShow: hasSelectDayCount === 7 ? false : true
      })
    }
  }

  componentWillReceiveProps(nextProps) {}

  checkSelectTimeRange = (allSelectedItems, index, lateT, notReturnT) => {
    if (isNaN(lateT) || isNaN(notReturnT)) {
      return
    }

    var latHour = Math.floor(lateT / 60)
    var latMin = Math.floor(lateT % 60)

    var notReturnHour = Math.floor(notReturnT / 60)
    var notReturnMin = Math.floor(notReturnT % 60)

    //小时对比
    if (latHour < 5 && (notReturnHour > 5 || notReturnHour < latHour)) {
      allSelectedItems[index].notReturnTimeError = true
    } else {
      if (latHour === notReturnHour && notReturnMin <= latMin) {
        allSelectedItems[index].notReturnTimeError = true
      } else {
        allSelectedItems[index].notReturnTimeError = false
      }
    }

    allSelectedItems[index].lateTime = lateT
    allSelectedItems[index].notReturnTime = notReturnT

    this.setState({
      allSelectedItems: allSelectedItems
    })
  }

  changeSchool = value => {
    let { schoolId } = this.state
    if (schoolId === value) {
      return
    }
    this.setState({
      schoolId: value
    })
  }

  addNewTimeRange = e => {
    let { allSelectedItems } = this.state
    let defaultItems = this.defaultItemsMap()
    defaultItems.groupNo = allSelectedItems.length + 1
    allSelectedItems.push(defaultItems)

    this.setState({
      allSelectedItems: allSelectedItems
    })
  }

  confirmButtonClicked = e => {
    let { schoolId, allSelectedItems } = this.state
    if (schoolId === '') {
      Noti.hintWarning('操作有误', '学校未选择')
      return
    }
    if (allSelectedItems.length === 0) {
      Noti.hintWarning('操作有误', '未设置归寝时间段')
      return
    }

    var items = []
    var body = {}

    var executeError = false
    allSelectedItems.forEach(r => {
      if (executeError === false) {
        if (
          r.lateTime === '' ||
          r.notReturnTime === '' ||
          r.dayList.length === 0 ||
          r.notReturnTimeError === true
        ) {
          Noti.hintWarning('操作有误', '还有信息未填全')
          executeError = true
        }

        var dayLists = r.dayList
        dayLists.forEach(value => {
          var item = {}
          console.log(value)
          item.day = DOORFORBID_WEEK[value]
          item.lateTime = r.lateTime
          item.notReturnTime = r.notReturnTime
          item.groupNo = r.groupNo
          items.push(item)
        })
      }
    })
    if (executeError) {
      return
    }
    body.items = items
    body.schoolId = parseInt(schoolId, 10)

    const callBack = ok => {
      if (ok) {
        this.props.history.goBack()
      }
    }
    fetchSaveSchollTimeRange(body, callBack)
  }
  backButtonClick = e => {
    this.props.history.goBack()
  }

  checkSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }

    const callBack = ok => {
      if (ok) {
        let { lastChooseSchoolId, schoolError } = this.state
        if (lastChooseSchoolId === v) {
          return
        } else {
          this.setState({
            lastChooseSchoolId: v
          })
        }
        if (schoolError) {
          this.setState({
            schoolError: false
          })
        }
      } else {
        let { lastChooseSchoolId } = this.state
        this.setState({
          schoolId: lastChooseSchoolId
        })
      }
    }

    checkSchoolTimeRangeExist(v, callBack)
  }

  getSchoolTimeInfo = e => {
    let { schoolId } = this.state
    fetchDoorFobidSchoolSettingList(schoolId, this.props, subModule)
  }

  chooseTimeRange = (event, record) => {
    event.preventDefault()
    event.stopPropagation()
    var willShowList = cloneDeep(this.timeRangeWeekData)

    let { allSelectedItems } = this.state
    //获取可以修改的项
    allSelectedItems.forEach(r => {
      if (r !== record) {
        willShowList.forEach(allWeekData => {
          if (r.dayList.indexOf(allWeekData.value) !== -1) {
            allWeekData.selected = true
          }
        })
      }
    })

    let unselectedTimeRanges = willShowList.filter(r => r.selected === false)
    if (record.dayList.length > 0) {
      //处理已选中的项
      unselectedTimeRanges.forEach(r => {
        if (record.dayList.indexOf(r.value) !== -1) {
          r.selected = true
        }
      })
    }

    if (unselectedTimeRanges.length > 0) {
      this.setState({
        showTimeRangeModal: true,
        currentUnselectedTimeRanges: unselectedTimeRanges
      })
      record.isSelected = true
    } else {
    }
  }

  changeLateTime = (event, index) => {
    let allSelectedItems = JSON.parse(
      JSON.stringify(this.state.allSelectedItems)
    )
    let lateT = event.toObject().hours * 60 + event.toObject().minutes
    let notReturnT = allSelectedItems[index].notReturnTime

    this.checkSelectTimeRange(allSelectedItems, index, lateT, notReturnT)
  }

  changeNotReturnTime = (event, index) => {
    let allSelectedItems = JSON.parse(
      JSON.stringify(this.state.allSelectedItems)
    )
    let notReturnT = event.toObject().hours * 60 + event.toObject().minutes
    let lateT = allSelectedItems[index].lateTime
    this.checkSelectTimeRange(allSelectedItems, index, lateT, notReturnT)
  }

  timeRangeConfirm = data => {
    let timeRanges = cloneDeep(data)
    let { allSelectedItems } = this.state

    let selectedTimeRanges = timeRanges.filter(r => r.selected === true)

    var timeTipString = ''
    var groupValue = []
    selectedTimeRanges.forEach(r => {
      if (r.selected === true) {
        if (timeTipString === '') {
          timeTipString += r.value
        } else {
          timeTipString += '、' + r.value
        }
        groupValue.push(r.value)
      }
    })

    //计数总共选中了多少个
    var totalSelectedDay = 0
    allSelectedItems.forEach(record => {
      //同步选中的item状态
      if (record.isSelected === true) {
        record.timeRangeString = timeTipString
        record.isSelected = false
        record.dayList = groupValue
      }
      totalSelectedDay += record.dayList.length
    })
    this.setState({
      addButtonShow: totalSelectedDay === 7 ? false : true,
      showTimeRangeModal: false
    })
  }

  closeTimeRangeSelect = e => {
    this.setState({
      showTimeRangeModal: false
    })
  }

  deleteButtonClick = (event, index) => {
    let allSelectedItems = JSON.parse(
      JSON.stringify(this.state.allSelectedItems)
    )

    allSelectedItems.splice(index, 1)

    allSelectedItems.forEach((item, i) => {
      item.groupNo = i + 1
    })
    this.setState({
      allSelectedItems: allSelectedItems
    })
  }

  forbidNotReturnHours = record => {
    var hour = Math.floor(record.lateTime / 60)
    var list = []
    if (hour > 5) {
      for (let index = 5; index < hour; index++) {
        list.push(index)
      }
    } else {
      for (let index = 5; index < 24; index++) {
        list.push(index)
      }
      for (let index = 0; index < hour; index++) {
        list.push(index)
      }
    }
    return list
  }

  render() {
    let {
      id,
      schoolId,
      schoolError,
      showTimeRangeModal,
      currentUnselectedTimeRanges,
      addButtonShow,
      allSelectedItems
    } = this.state

    let l = allSelectedItems.length
    const itemsGroup =
      allSelectedItems &&
      allSelectedItems.map((record, index) => {
        return (
          <Fragment key={index}>
            <li>
              <p>时间段:</p>
              {record.timeRangeString}
              <a
                className="mgl10"
                href=""
                onClick={event => {
                  this.chooseTimeRange(event, record)
                }}
              >
                点击选择
              </a>
              {index !== 0 ? (
                <div>
                  <Button
                    className="backDormDelBtn"
                    onClick={event => {
                      this.deleteButtonClick(event, index)
                    }}
                  >
                    删除
                  </Button>
                </div>
              ) : null}
            </li>

            <li>
              <p>正常归寝:</p>
              <div>
                <TimePicker
                  className="timepicker"
                  allowEmpty={false}
                  showSecond={false}
                  value={moment({
                    hour: Math.floor(record.lateTime / 60),
                    minute: record.lateTime % 60
                  })}
                  onChange={event => {
                    this.changeLateTime(event, index)
                  }}
                />
                <span>以前</span>
              </div>
            </li>

            <li>
              <p>晚归:</p>
              <TimePicker
                className="timepicker"
                allowEmpty={false}
                showSecond={false}
                value={moment({
                  hour: Math.floor(record.lateTime / 60),
                  minute: record.lateTime % 60
                })}
                onChange={event => {
                  this.changeLateTime(event, index)
                }}
              />
              <span>至</span>
              <TimePicker
                className="timepicker"
                allowEmpty={false}
                showSecond={false}
                value={moment({
                  hour: Math.floor(record.notReturnTime / 60),
                  minute: record.notReturnTime % 60
                })}
                onChange={event => {
                  this.changeNotReturnTime(event, index)
                }}
                hideDisabledOptions
                disabledHours={event => {
                  return this.forbidNotReturnHours(record)
                }}
              />
              {record.notReturnTimeError ? (
                <span className="checkInvalid">
                  未归寝时间需要在合理范围内,请重新选择！
                </span>
              ) : null}
            </li>

            <li>
              <p>未归:</p>
              <TimePicker
                className="timepicker"
                allowEmpty={false}
                showSecond={false}
                value={moment({
                  hour: Math.floor(record.notReturnTime / 60),
                  minute: record.notReturnTime % 60
                })}
                onChange={event => {
                  this.changeNotReturnTime(event, index)
                }}
                hideDisabledOptions
                disabledHours={event => {
                  return this.forbidNotReturnHours(record)
                }}
              />
              <span>以后</span>
            </li>
          </Fragment>
          // <BackDormSettingItem
          //   startTime={record.startTime}
          //   endTime={record.endTime}
          //   timeRangeString={record.timeRangeString}
          // />
        )
      })

    return (
      <div className="infoList backDormWrapper">
        <ul>
          <li>
            <p> 选择学校: </p>
            <SchoolSelector
              disable={id}
              width={SELECTWIDTH}
              className={id ? 'disabled' : ''}
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>

          {itemsGroup}

          {addButtonShow ? (
            <li>
              <p />
              <Button
                type="primary"
                className="addBtn"
                count={l}
                onClick={this.addNewTimeRange}
                width={SELECTWIDTH}
              >
                增加一个时段
              </Button>
            </li>
          ) : null}
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirmButtonClicked}>
            确认
          </Button>
          <Button onClick={this.backButtonClick}>返回</Button>
        </div>

        <MultiSelectModal
          closeModal={this.closeTimeRangeSelect}
          confirm={this.timeRangeConfirm}
          show={showTimeRangeModal}
          dataSource={currentUnselectedTimeRanges}
          columns={this.timeRangeColumns}
          suportAllChoose={true}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  timeRange_dataSource: state.doorForbidModule[subModule].timeRange_dataSource
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid
  })(BackDormSettingInfo)
)
