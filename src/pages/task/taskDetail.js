import React from 'react'
import {
  Table,
  Badge,
  Button,
  Modal,
  Carousel,
  Menu,
  Dropdown,
  Pagination
} from 'antd'

import Time from '../../util/time'
import Noti from '../../util/noti'
import AjaxHandler from '../../util/ajax'
import CONSTANTS from '../../constants'
import LoadingMask from '../component/loadingMask'
import RepairmanTable from '../component/repairmanChoose'
import EmployeeChoose from '../component/employeeChoose'
import BasicSelector from '../component/basicSelectorWithoutAll'
import DepartmentChoose from '../component/departmentChoose'
import { checkObject } from '../../util/checkSame'
import closeBtn from '../assets/close.png'
import { mul, add } from '../../util/numberHandle'
import Format from '../../util/format'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeTask,
  changeOrder,
  changeDevice,
  changeFund
} from '../../actions'
const {
  TASK_BUILD_CMP,
  TASK_TYPE_FEEDBACK,
  TASK_TYPE_REPAIR,
  DEVICE_TYPE_BLOWER,
  WASHER_RATE_TYPES,
  DEVICE_TYPE_WASHER,
  TASK_HANDLE_BUILD
} = CONSTANTS
const subModule = 'taskList'

const DETAILTAB2NAME = {
  1: 'committer',
  2: 'committerOrder',
  3: 'committerRepair',
  4: 'deviceInfo',
  5: 'deviceOrder',
  6: 'deviceRepair',
  7: 'userFundRecord',
  8: 'userComplaints',
  9: 'userFeedbacks'
}
const TABINDEX2RES = {
  1: '/user/one',
  2: '/order/list',
  3: '/work/order/list',
  4: '/device/one',
  5: '/order/list',
  6: '/work/order/list',
  7: '/funds/list',
  8: '/work/order/list',
  9: '/work/order/list'
}
const DETAILTAB2JSONNAME = {
  2: 'orders',
  3: 'workOrders',
  5: 'orders',
  6: 'workOrders',
  7: 'funds',
  8: 'workOrders',
  9: 'workOrders'
}

const TAB2HINT = {
  2: '用户近五笔订单',
  3: '用户近五次报修记录',
  5: '设备近五笔订单',
  6: '设备近五次维修记录',
  7: '用户近五次充值提现',
  8: '用户近五次投诉',
  9: '用户近五次反馈'
}

const TASKTYPE = {
  1: '报修工单',
  2: '投诉工单',
  3: '意见反馈'
}

const roleModalName = {
  1: 'showCustomerModal',
  2: 'showRepairmanModal',
  3: 'showDeveloperModal'
}
const SIZE = CONSTANTS.TASK_DETAIL_LIST_LENGTH
const {
  TASK_PENDING,
  TASK_ASSIGNED,
  TASK_ACCEPTED,
  TASK_REFUSED,
  TASK_FINISHED
} = CONSTANTS
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/

class TaskDetail extends React.Component {
  static propTypes = {
    taskList: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      id: '', // if for the task
      creatorId: '',
      userId: '',
      loading: false,
      total: 0,
      showDetailImgs: false,
      initialSlide: 0,
      tabLoading: false,
      reassignKey: '',
      note: '',
      showCustomerModal: false,
      showRepairmanModal: false,
      showDeveloperModal: false,
      showFinishModal: false,
      posting: false,
      loadingId: '',
      message: '',
      messageError: false,
      finishContentError: false,
      tag: '',
      tagError: false
    }
    this.reassignMenu = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={2}>
          <span className="menuItem">维修员</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )

    this.reassignWithoutRepairman = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )

    this.committerOrderColumns = [
      {
        title: '使用设备',
        dataIndex: 'deviceType',
        width: '14%',
        render: (text, record, index) => CONSTANTS.DEVICETYPE[record.deviceType]
      },
      {
        title: '设备地址',
        dataIndex: 'location',
        width: '17%'
      },
      {
        title: '开始时间',
        dataIndex: 'createTime',
        width: '21%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.createTime)
        }
      },
      {
        title: '结束时间',
        dataIndex: 'finishTime',
        width: '21%',
        render: (text, record, index) => {
          return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        render: (text, record, index) => {
          switch (record.status) {
            case 1:
              return <Badge status="warning" text="使用中" />
            case 2:
              return <Badge status="success" text="使用结束" />
            case 4:
              return <Badge status="default" text="已退单" />
            case 3:
              return <Badge status="warning" text="异常" />
            default:
              return <Badge status="warning" text="异常" />
          }
        }
      },
      {
        title: '消费金额',
        dataIndex: 'paymentType',
        width: '12%',
        className: 'shalowRed',
        render: (text, record, index) => {
          if (record.status !== 1) {
            return `${record.consume}` || '暂无'
          } else if (record.prepay) {
            return `${record.prepay}`
          }
        }
      }
    ]

    this.committerRepairColumns = [
      {
        title: '报修设备',
        dataIndex: 'deviceType',
        width: '12%',
        render: (text, record, index) =>
          record.deviceType ? CONSTANTS.DEVICETYPE[record.deviceType] : ''
      },
      {
        title: '报修内容',
        dataIndex: 'description',
        width: '23%'
      },
      {
        title: '报修图片',
        dataIndex: 'images',
        width: '25%',
        render: (text, record, index) => {
          let imagelis =
            record.images &&
            record.images.map((r, i) => (
              <li className="thumbnail" key={i}>
                <img
                  src={CONSTANTS.FILEADDR + r}
                  alt=""
                  onClick={() => {
                    this.showTabImg(index, i)
                  }}
                  onLoad={e => this.setWH(e, 30)}
                />
              </li>
            ))
          return <ul className="thumbnailWrapper">{imagelis}</ul>
        }
      },
      {
        title: '报修时间',
        dataIndex: 'createTime',
        width: '21%',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : ''
      },
      {
        title: '维修状态',
        dataIndex: 'status',
        width: '19%',
        render: (text, record, index) => {
          switch (record.status) {
            case TASK_FINISHED:
              return <Badge status="success" text="维修完成" />
            case TASK_PENDING:
              return <Badge status="warning" text="待处理" />
            case TASK_ASSIGNED:
            case TASK_ACCEPTED:
            case TASK_REFUSED:
              return <Badge status="error" text={'处理中'} />
            default:
              return '已取消'
          }
        }
      }
    ]

    this.deviceOrderColumns = [
      {
        title: '用户',
        dataIndex: 'username',
        width: '15%'
      },
      {
        title: '手机型号',
        dataIndex: 'mobileModel',
        width: '15%'
      },
      {
        title: '开始时间',
        dataIndex: 'createTime',
        width: '21%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.createTime)
        }
      },
      {
        title: '结束时间',
        dataIndex: 'finishTime',
        width: '21%',
        render: (text, record, index) => {
          return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        render: (text, record, index) => {
          switch (record.status) {
            case 1:
              return <Badge status="warning" text="使用中" />
            case 2:
              return <Badge status="success" text="使用结束" />
            case 4:
              return <Badge status="default" text="已退单" />
            case 3:
              return <Badge status="warning" text="异常" />
            default:
              return <Badge status="warning" text="异常" />
          }
        }
      },
      {
        title: '消费金额',
        dataIndex: 'paymentType',
        width: '12%',
        className: 'shalowRed',
        render: (text, record, index) => {
          if (record.status !== 1) {
            return `${record.consume}` || '暂无'
          } else if (record.prepay) {
            return `${record.prepay}`
          }
        }
      }
    ]

    this.deviceRepairColumns = [
      {
        title: '报修设备',
        dataIndex: 'deviceType',
        width: '12%',
        render: (text, record, index) =>
          record.deviceType ? CONSTANTS.DEVICETYPE[record.deviceType] : '未知'
      },
      {
        title: '报修内容',
        dataIndex: 'description',
        width: '23%'
      },
      {
        title: '报修图片',
        dataIndex: 'images',
        width: '25%',
        render: (text, record, index) => {
          let imagelis =
            record.images &&
            record.images.map((r, i) => (
              <li className="thumbnail" key={i}>
                <img
                  src={CONSTANTS.FILEADDR + r}
                  alt=""
                  onClick={() => {
                    this.showTabImg(index, i)
                  }}
                  onLoad={e => this.setWH(e, 30)}
                />
              </li>
            ))
          return <ul className="thumbnailWrapper">{imagelis}</ul>
        }
      },
      {
        title: '报修时间',
        dataIndex: 'createTime',
        width: '21%',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : '未知'
      },
      {
        title: '维修状态',
        dataIndex: 'status',
        width: '19%',
        render: (text, record, index) => {
          switch (record.status) {
            case TASK_FINISHED:
              return <Badge status="success" text="维修完成" />
            case TASK_PENDING:
              return <Badge status="warning" text="待处理" />
            case TASK_ASSIGNED:
            case TASK_ACCEPTED:
            case TASK_REFUSED:
              return <Badge status="error" text={'处理中'} />
            default:
              return '已取消'
          }
        }
      }
    ]

    this.userFundColumns = [
      {
        title: '时间',
        dataIndex: 'createTime',
        width: '25%',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: '操作类型',
        dataIndex: 'operationType',
        width: '25%',
        render: (text, record) => {
          if (record.instead) {
            return CONSTANTS.FUNDTYPE[record.operationType] + '(代充值)'
          } else {
            return CONSTANTS.FUNDTYPE[record.operationType]
          }
        }
      },
      {
        title: '操作状态',
        dataIndex: 'status',
        width: '25%',
        render: (text, record, index) => {
          switch (record.status) {
            case 1:
              return (
                <Badge
                  status="error"
                  text={CONSTANTS.WITHDRAWSTATUS[record.status]}
                />
              )
            case 2:
            case 5:
            case 6:
              return (
                <Badge
                  status="default"
                  text={CONSTANTS.WITHDRAWSTATUS[record.status]}
                />
              )
            case 3:
              return (
                <Badge
                  status="warning"
                  text={CONSTANTS.WITHDRAWSTATUS[record.status]}
                />
              )
            case 4:
              return (
                <Badge
                  status="success"
                  text={CONSTANTS.WITHDRAWSTATUS[record.status]}
                />
              )
            default:
              return <Badge status="warning" text="未知" />
          }
        }
      },
      {
        title: '金额',
        dataIndex: 'amount',
        className: 'shalowRed',
        render: text => `¥${text}`
      }
    ]

    this.userComplaintsColumns = [
      {
        title: '投诉类型',
        dataIndex: 'orderType',
        width: '15%',
        render: (text, record) => CONSTANTS.COMPLAINTTYPES[record.orderType]
      },
      {
        title: '投诉内容',
        dataIndex: 'description',
        width: '35%'
      },
      {
        title: '报修图片',
        dataIndex: 'images',
        width: '30%',
        render: (text, record, index) => {
          let imagelis =
            record.images &&
            record.images.map((r, i) => (
              <li className="thumbnail" key={i}>
                <img
                  src={CONSTANTS.FILEADDR + r}
                  alt=""
                  onClick={() => {
                    this.showTabImg(index, i)
                  }}
                  onLoad={e => this.setWH(e, 30)}
                />
              </li>
            ))
          return <ul className="thumbnailWrapper">{imagelis}</ul>
        }
      },
      {
        title: '投诉时间',
        dataIndex: 'createTime',
        width: '20%',
        render: (text, record) => Time.getTimeStr(record.createTime)
      }
    ]

    this.userFeedbacksColumns = [
      {
        title: '反馈类型',
        dataIndex: 'opt',
        width: '15%',
        render: (text, record) => CONSTANTS.FEEDBACKTYPES[record.opt]
      },
      {
        title: '反馈内容',
        dataIndex: 'description',
        width: '35%'
      },
      {
        title: '反馈图片',
        dataIndex: 'images',
        width: '30%',
        render: (text, record, index) => {
          let imagelis =
            record.images &&
            record.images.map((r, i) => (
              <li className="thumbnail" key={i}>
                <img
                  src={CONSTANTS.FILEADDR + r}
                  alt=""
                  onClick={() => {
                    this.showTabImg(index, i)
                  }}
                  onLoad={e => this.setWH(e, 30)}
                />
              </li>
            ))
          return <ul className="thumbnailWrapper">{imagelis}</ul>
        }
      },
      {
        title: '反馈时间',
        dataIndex: 'createTime',
        render: (text, record) =>
          record.createTime ? Time.getTimeStr(record.createTime) : '暂无'
      }
    ]
  }
  componentDidMount() {
    // this.props.hide(false)
    // if showing, get id.
    try {
      let { details, selectedDetailId } = this.props.taskList
      let id = selectedDetailId,
        nextState = { id }
      if (details && details.creatorId) {
        nextState.creatorId = details.creatorId
      }
      this.setState(nextState)
    } catch (e) {
      console.log(e)
    }
  }
  componentWillUnmount() {
    // this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    try {
      let {
        main_phase,
        details,
        detail_tabIndex,
        showDetail,
        selectedDetailId,
        detailLoading
      } = nextProps.taskList
      // let page = panel_page[main_phase]

      // only care detail related props
      if (
        showDetail &&
        !checkObject(this.props.taskList, nextProps.taskList, [
          'detail_tabIndex',
          'selectedDetailId',
          'detailLoading'
        ])
      ) {
        // get selected item.
        // let selectedItem = panel_dataSource[main_phase][page] && panel_dataSource[main_phase][page][selectedRowIndex] // selected row
        let id = selectedDetailId,
          detail = details
        if (detail.id) {
          // if not, fetch detail
          // let type = selectedItem.type
          // detail = details
          console.log(detail)
          let tabIndex = detail_tabIndex[main_phase]
          let key = DETAILTAB2NAME[tabIndex]
          if (detail.env === 2) {
            // if initiated by employee, do not fetch these infos.
            return
          }
          if (detail.hasOwnProperty(key)) {
            // nothing
          } else {
            let resource = TABINDEX2RES[tabIndex]
            let userId = detail.creatorId
            let residenceId = detail.residenceId || ''
            let deviceType = detail.deviceType || ''
            let { deviceId, level } = detail

            const body = {}
            if (tabIndex === 1) {
              body.id = userId
            } else if (tabIndex === 2) {
              body.page = 1
              body.size = SIZE
              body.userId = userId
            } else if (tabIndex === 3) {
              body.page = 1
              body.size = SIZE
              body.all = true
              body.creatorId = userId
              body.type = CONSTANTS.TASK_TYPE_REPAIR
            } else if (tabIndex === 4) {
              // body.
              if (deviceType === 2) {
                resource = '/device/water/one'
                body.id = residenceId
              } else {
                resource = '/device/group/one'
                body.id = deviceId
              }
            } else if (tabIndex === 5) {
              body.page = 1
              body.size = SIZE
              body.residenceId = residenceId
              body.deviceType = deviceType
            } else if (tabIndex === 6) {
              body.page = 1
              body.size = SIZE
              body.all = true
              body.type = CONSTANTS.TASK_TYPE_REPAIR
              body.residenceId = residenceId
              body.deviceType = deviceType
            } else if (tabIndex === 7) {
              // user fund record
              body.page = 1
              body.size = SIZE
              body.userId = userId
            } else if (tabIndex === 8) {
              // user complaint
              body.page = 1
              body.size = SIZE
              body.type = CONSTANTS.TASK_TYPE_COMPLAINT
              body.creatorId = userId
            } else if (tabIndex === 9) {
              // user feedback
              body.page = 1
              body.size = SIZE
              body.type = TASK_TYPE_FEEDBACK
              body.creatorId = userId
            }
            const cb = json => {
              this.setState({
                tabLoading: false
              })
              let jsonDataName = DETAILTAB2JSONNAME[tabIndex],
                data = {}
              if (tabIndex === 1 || tabIndex === 4) {
                data = json.data
              } else {
                data = json.data[jsonDataName]
              }
              let newDetails = JSON.parse(JSON.stringify(details))
              // if 'complaint' or 'feedback', build different structure for page change.
              if (tabIndex === 8 || tabIndex === 9) {
                newDetails[key] = {}
                newDetails[key]['dataSource'] = data
                newDetails[key]['page'] = 1
                newDetails[key]['total'] = json.data.total
              } else {
                newDetails[key] = data
              }
              this.props.changeTask(subModule, {
                details: newDetails
              })
            }
            AjaxHandler.ajax(resource, body, cb)

            // set state
            let nextState = {
              tabLoading: true
            }
            if (id && id !== this.state.id) {
              nextState.id = id
            }
            if (userId && userId !== this.state.userId) {
              nextState.userId = userId
            }
            if (detail.creatorId && detail.creatorId !== this.state.creatorId) {
              nextState.creatorId = detail.creatorId
            }
            if (deviceType && deviceType !== this.state.deviceType) {
              nextState.deviceType = deviceType
            }
            if (residenceId && residenceId !== this.state.residenceId) {
              nextState.residenceId = residenceId
            }
            if (level && level !== this.state.level) {
              nextState.level = level
            }
            this.setState(nextState)
          }
        } else if (!detailLoading) {
          const body = {
            id: id
          }
          this.fetchTaskDetail(body)
        }
        if (this.state.message !== '') {
          this.setState({
            message: ''
          })
        }
      }
      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }
  fetchTaskDetail = body => {
    if (this.props.taskList.detailLoading && body.id === this.state.loadingId) {
      return
    }
    this.props.changeTask(subModule, {
      detailLoading: true
    })
    let resource = '/work/order/one'
    const cb = json => {
      // only handle data here
      let { details } = this.props.taskList
      let newDetails = Object.assign({}, details, json.data)
      let value = {
        details: newDetails,
        detailLoading: false
      }
      console.log(newDetails)
      // set data into store
      this.props.changeTask(subModule, value)
    }
    // console.log(resource)
    this.setState({
      loadingId: body.id
    })
    AjaxHandler.ajax(resource, body, cb, null, null, this.clearDetailLoading)
  }
  // clear 'detailLoading' in store, for error handling.
  clearDetailLoading = () => {
    this.props.changeTask(subModule, {
      detailLoading: false
    })
  }
  changeDivision = v => {
    let { all } = this.state
    if (v !== all) {
      this.props.changeTask(subModule, { all: v, page: 1 })
    }
  }
  changeType = v => {
    let { type } = this.props
    if (type !== v) {
      this.props.changeTask(subModule, { sourceType: v, page: 1 })
    }
  }
  changePending = v => {
    let { assigned } = this.props
    if (v !== assigned) {
      this.props.changeTask(subModule, { pending: v, page: 1 })
    }
  }
  toNa = e => {
    e.preventDefault()
    let { assigned } = this.props
    if (assigned) {
      this.props.changeTask(subModule, { assigned: false, page: 1 })
    }
  }
  toAssigned = e => {
    e.preventDefault()
    let { assigned } = this.props
    if (!assigned) {
      this.props.changeTask(subModule, { assigned: true, page: 1 })
    }
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeTask(subModule, { page: page })
  }
  changeSchool = v => {
    let { schoolId } = this.props
    if (v === schoolId) {
      return
    }
    this.props.changeTask(subModule, { schoolId: v })
  }
  changePhase = e => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      let { main_phase } = this.props.taskList
      if (main_phase !== key) {
        this.props.changeTask(subModule, { main_phase: key })
      }
    } catch (e) {
      console.log(e)
    }
  }
  close = e => {
    this.props.changeTask(subModule, {
      details: {},
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
  }
  showTabImg = (index, i) => {
    this.setState({
      indexOfImgDataInSource: index,
      initialSlide: i,
      showTabImg: true
    })
  }
  closeTabImgs = () => {
    this.setState({
      initialSlide: 1,
      showTabImg: false
    })
  }

  showDetailImgModel = i => {
    this.setState({
      initialSlide: i,
      showDetailImgs: true
    })
  }
  setWH = (e, value) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = value ? `${value}px` : '50px'
    } else {
      img.style.height = value ? `${value}px` : '50px'
    }
  }
  changeTabIndex = e => {
    try {
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      if (key) {
        let { main_phase, detail_tabIndex } = this.props.taskList
        let current = detail_tabIndex[main_phase]
        if (key !== current) {
          let newTabIndex = Array.from(detail_tabIndex)
          newTabIndex[main_phase] = key
          this.props.changeTask(subModule, {
            detail_tabIndex: newTabIndex
          })
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  reassign = m => {
    try {
      let { key } = m
      // open different modal according to role
      let nextState = {
        reassignKey: key
      }
      let modalStateName = roleModalName[key]
      nextState[modalStateName] = true
      this.setState(nextState)
    } catch (e) {
      console.log(e)
    }
  }
  confirmChooseRepairman = () => {
    // reassign to repairman success
    let { id } = this.state
    this.setState({
      showRepairmanModal: false
    })
    Noti.hintOk('转发成功', '已成功转发给该维修员')
    this.updateAndClose(id)
  }
  cancelChooseRepairman = () => {
    this.setState({
      showRepairmanModal: false
    })
  }
  confirmChooseCustomer = () => {
    // reassign to repairman success
    let { id } = this.state
    this.setState({
      showCustomerModal: false
    })
    Noti.hintOk('转发成功', '已成功转发给该客服')
    this.updateAndClose(id)
  }
  cancelChooseCustomer = () => {
    this.setState({
      showCustomerModal: false
    })
  }
  reassign2DeveloperSuccess = () => {
    Noti.hintOk('操作成功', '当前工单已被转接')
    this.setState({
      showDeveloperModal: false
    })
    this.updateAndClose(this.state.id)
  }
  cancelChooseDeveloper = () => {
    this.setState({
      showDeveloperModal: false
    })
  }
  keepAndUpdate = id => {
    // this is handle process after sending message.
    // 1. update detail.
    // 2. if main_phase === 1, nothing to do with list.
    // 3. if main_phase === 0, set 'selectedRowIndex' to -1,  clear list, set 'main_phase' to 1
    let resource = '/work/order/one'
    const body = {
      id: id
    }
    const cb = json => {
      let { status, logs, endTime, level, handleLimit } = json.data
      let details = JSON.parse(JSON.stringify(this.props.taskList.details))
      if (details.id) {
        // should always exist
        let detail = details
        detail.status = status
        detail.logs = logs
        if (endTime) {
          detail.endTime = endTime
        }
        if (level) {
          detail.level = level
        }
        if (handleLimit) {
          detail.handleLimit = handleLimit
        }
      }
      this.props.changeTask(subModule, {
        details: details
      })
    }
    AjaxHandler.ajax(resource, body, cb)
    /* no matter ajax success or fail, check if fetch list again */
    // Note to keep 'selectedDetailId'.
    // only clear 'pending' and 'handing', because it won't be in 'finished' when sending message.
    let { main_phase } = this.props.taskList
    if (main_phase === 1) {
      // if in 'handing' module
      return
    } else {
      let {
        panel_rangeIndex,
        panel_startTime,
        panel_endTime,
        panel_type,
        panel_selectKey,
        panel_page,
        details
      } = this.props.taskList
      let type = details.type
      let panel_dataSource = JSON.parse(
        JSON.stringify(this.props.taskList.panel_dataSource)
      )
      delete panel_dataSource[1]
      delete panel_dataSource[2]
      // set props for 'handling', make sure detail can be found in list data.
      let newRangeIndex = Array.from(panel_rangeIndex)
      newRangeIndex[1] = 3
      let newStartTime = Array.from(panel_startTime)
      newStartTime[1] = ''
      let newEndTime = Array.from(panel_endTime)
      newEndTime[1] = ''
      let newType = Array.from(panel_type)
      newType[1] = add(type, 1)
      let newKeys = Array.from(panel_selectKey)
      newKeys[1] = ''
      let newPages = Array.from(panel_page)
      newPages[1] = 1
      let newProps = {
        selectedRowIndex: -1,
        panel_dataSource: panel_dataSource,
        main_phase: 1,
        panel_rangeIndex: newRangeIndex,
        panel_startTime: newStartTime,
        panel_endTime: newEndTime,
        panel_type: newType,
        panel_selectKey: newKeys,
        panel_page: newPages
      }
      this.props.changeTask(subModule, newProps)
    }
  }
  updateAndClose = id => {
    /*
    let resource = '/work/order/one'
    const body = {
      id: id
    }
    const cb = (json) => {
      let {status, logs, endTime, level, handleLimit} = json.data
      let details = JSON.parse(JSON.stringify(this.props.taskList.details))
      if (details.id) { // should always exist
        let detail = details
        detail.status = status
        detail.logs = logs
        if (endTime) {
          detail.endTime = endTime
        }
        if (level) {
          detail.level = level
        }
        if (handleLimit) {
          detail.handleLimit = handleLimit
        }
      }
      this.props.changeTask(subModule, {
        details: details
      })
    }
    AjaxHandler.ajax(resource, body, cb)
    */
    /* no matter ajax success or fail, close detail and fetch list again */
    // let {showDetail, selectedRowIndex, panel_dataSource} = this.props.taskList
    let newProps = {
      details: {},
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1,
      panel_dataSource: {}
    }
    this.props.changeTask(subModule, newProps)
  }
  finishTask = () => {
    this.setState({
      showFinishModal: true
    })
  }
  changeNote = e => {
    this.setState({
      note: e.target.value,
      finishContentError: false
    })
  }
  confirmFinish = () => {
    let { id, note, tag, posting } = this.state
    let { type } = this.props.taskList.details
    if (posting) {
      return
    }

    if (!tag) {
      return this.setState({
        tagError: true
      })
    }
    let content = note.trim()
    // content must not be empty when finishing repair task
    if (type === TASK_TYPE_REPAIR && !content) {
      return this.setState({
        finishContentError: true
      })
    }

    let resource = '/work/order/handle'
    const body = {
      id: id,
      type: CONSTANTS.TASK_HANDLE_FINISH, // finish
      env: TASK_BUILD_CMP,
      tag: +tag
    }
    console.log(type)
    if (content) {
      body.content = content
    }
    const cb = json => {
      let nextState = {
        posting: false
      }
      if (json.data.result) {
        // success
        nextState.showFinishModal = false
        nextState.note = ''
        nextState.tag = ''
        Noti.hintOk('操作成功', '当前工单已完结')
        // refetch details
        this.updateAndClose(id)
      } else {
        Noti.hintWarning('', json.data.failReason || '操作失败，请稍后重试')
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  closeFinishModal = () => {
    this.setState({
      note: '',
      tag: '',
      tagError: false,
      showFinishModal: false,
      finishContentError: false
    })
  }
  goToMore = e => {
    e.preventDefault()
    try {
      let { main_phase, details, detail_tabIndex } = this.props.taskList
      let detail = details

      let { deviceType, creatorId, residenceId, userMobile } = detail

      let currentTab = detail_tabIndex[main_phase]
      if (currentTab === 2) {
        this.props.changeOrder('orderList', {
          page: 1,
          schoolId: 'all',
          deviceType: 'all',
          status: 'all',
          selectKey: ''
        })
        this.props.history.push({
          pathname: '/order/list',
          state: { path: 'fromTask', userId: creatorId }
        })
      } else if (currentTab === 3) {
        this.props.changeDevice('repair', {
          page: 1,
          schoolId: 'all',
          deviceType: 'all',
          status: 'all'
        })
        this.props.history.push({
          pathname: '/device/repair',
          state: { path: 'fromTask', userId: creatorId }
        })
      } else if (currentTab === 5) {
        this.props.changeOrder('orderList', {
          page: 1,
          schoolId: 'all',
          deviceType: deviceType ? deviceType.toString() : 'all',
          status: 'all',
          selectKey: ''
        })
        this.props.history.push({
          pathname: '/order/list',
          state: {
            path: 'fromTask',
            deviceType: deviceType,
            residenceId: residenceId
          }
        })
      } else if (currentTab === 6) {
        this.props.changeDevice('repair', {
          page: 1,
          schoolId: 'all',
          deviceType: 'all',
          status: 'all'
        })
        this.props.history.push({
          pathname: '/device/repair',
          state: {
            path: 'fromTask',
            deviceType: deviceType,
            residenceId: residenceId
          }
        })
      } else if (currentTab === 7) {
        this.props.changeFund('fundList', {
          page: 1,
          selectKey: userMobile ? userMobile.toString() : '',
          type: 'all',
          status: 'all',
          schoolId: 'all',
          startTime: Time.get7DaysAgoStart(),
          endTime: Time.getTodayEnd()
        })
        this.props.history.push({
          pathname: '/fund/list',
          state: { path: 'fromTask', mobile: userMobile }
        })
      }
    } catch (e) {
      console.log(e)
    }
  }
  closeDetailImgs = () => {
    this.setState({
      showDetailImgs: false
    })
  }
  changeMessage = e => {
    this.setState({
      message: e.target.value,
      messageError: false
    })
  }
  confirmPostMessage = (id, userMobile) => {
    console.log('posting message')
    // debugger
    let { message, posting } = this.state
    if (posting) {
      return
    }
    let m = message.trim()
    if (!m || m.length > 200) {
      return this.setState({
        messageError: true
      })
    }
    let resource = '/work/order/handle'
    const body = {
      id: id,
      content: m,
      type: CONSTANTS.TASK_HANDLE_SENDMESSAGE
    }
    const cb = json => {
      this.setState({
        posting: false,
        message: ''
      })
      if (json.data) {
        Noti.hintOk('操作成功', '已成功发送消息')
      }
      // keep detail and check if need to fetch list
      this.keepAndUpdate(id)
    }
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  changeComplaintPage = (page, pageSize) => {
    try {
      let { creatorId } = this.state
      // fetch more
      let resource = '/work/order/list'
      const body = {}
      body.page = page
      body.size = SIZE
      body.type = CONSTANTS.TASK_TYPE_COMPLAINT
      body.creatorId = creatorId

      const cb = json => {
        this.setState({
          tabLoading: false
        })
        let newDetails = JSON.parse(JSON.stringify(this.props.taskList.details))
        let userComplaints = newDetails.userComplaints
        userComplaints.page = page
        userComplaints.total = json.data.total
        userComplaints.dataSource = json.data.workOrders
        this.props.changeTask(subModule, {
          details: newDetails
        })
      }
      this.setState({
        tabLoading: true
      })
      AjaxHandler.ajax(resource, body, cb)
    } catch (e) {
      console.log(e)
    }
  }
  changeFeedbackPage = (page, pageSize) => {
    try {
      console.log(page)
      let { creatorId } = this.state
      // fetch more
      let resource = '/work/order/list'
      const body = {}
      body.page = page
      body.size = SIZE
      body.type = CONSTANTS.TASK_TYPE_FEEDBACK
      body.creatorId = creatorId

      const cb = json => {
        this.setState({
          tabLoading: false
        })
        let newDetails = JSON.parse(JSON.stringify(this.props.taskList.details))
        let userFeedbacks = newDetails.userFeedbacks
        userFeedbacks.page = page
        userFeedbacks.total = json.data.total
        userFeedbacks.dataSource = json.data.workOrders
        this.props.changeTask(subModule, {
          details: newDetails
        })
      }
      this.setState({
        tabLoading: true
      })
      AjaxHandler.ajax(resource, body, cb)
    } catch (e) {
      console.log(e)
    }
  }
  changeTag = v => {
    this.setState({
      tag: v,
      tagError: false
    })
  }
  checkTag = v => {
    if (!v) {
      this.setState({
        tagError: true
      })
    }
  }
  render() {
    const {
      showDetailImgs,
      tabLoading,
      showCustomerModal,
      showRepairmanModal,
      showDeveloperModal,
      note,
      showFinishModal,
      message,
      showTabImg,
      indexOfImgDataInSource, // index of [dataSource:item], shows which item's images is been viewing.
      initialSlide, // initial slide of img
      messageError,
      finishContentError,
      tag,
      tagError
    } = this.state

    let {
      main_phase,
      details,
      showDetail,
      detailLoading,
      detail_tabIndex,
      selectedDetailId
    } = this.props.taskList
    const { forbiddenStatus, tags } = this.props

    let currentTab = detail_tabIndex[main_phase]

    /* get info from 'details', 'details' is an object whose key is 'id' */
    // get type and id
    // let page = panel_page[main_phase]
    // let selectedItem = panel_dataSource[main_phase] && panel_dataSource[main_phase][page] && panel_dataSource[main_phase][page][selectedRowIndex] // selected row
    let id = selectedDetailId
    let detail = details || {} // info of current selected item
    // console.log(detail);
    let {
      committer,
      committerOrder,
      committerRepair,
      deviceInfo,
      deviceOrder,
      deviceRepair,
      userFundRecord,
      userComplaints,
      userFeedbacks,
      schoolId,
      schoolName,
      deviceType,
      location,
      repairCause,
      description,
      images,
      userMobile,
      logs,
      creatorName,
      assignName,
      createTime,
      status,
      opt,
      orderType,
      orderNo,
      env,
      type,
      exist,
      handleLimit,
      level
    } = detail

    let denomination =
      parseInt(deviceType, 10) === DEVICE_TYPE_BLOWER ? '秒' : '脉冲'

    // info for device detail
    let { bindingTime, price, pulse, prepayOption, waterTimeRange, rates } =
      deviceInfo || {}
    let rateItems =
      deviceType === DEVICE_TYPE_WASHER
        ? rates &&
          rates.map((r, i) => (
            <span key={i}>{`${WASHER_RATE_TYPES[r.pulse]}/${
              r.price ? r.price : ''
            }元`}</span>
          ))
        : pulse &&
          price && <span>{`${mul(price, 100)}元/${pulse}${denomination}`}</span>
    let timeItem =
      waterTimeRange &&
      waterTimeRange.items &&
      waterTimeRange.items.map((r, i) => (
        <span key={i} className="inline padR10">
          {Format.adding0(r.startTime.hour)}:{Format.adding0(
            r.startTime.minute
          )}~{Format.adding0(r.endTime.hour)}:{Format.adding0(r.endTime.minute)}
        </span>
      ))

    // current page for 'complaint' or 'feedback' page
    let complaintPage = userComplaints && userComplaints.page
    let feedbackPage = userFeedbacks && userFeedbacks.page
    let complaintTotal = userComplaints && userComplaints.total
    let feedbackTotal = userFeedbacks && userFeedbacks.total

    // for detail images, not images in detail tab
    const imgs =
      images &&
      images.map((r, i) => (
        <img
          // src='http://img02.sogoucdn.com/app/a/100520020/95cbca3276545c38a65f7827fc56b951'
          src={CONSTANTS.FILEADDR + r}
          onClick={() => this.showDetailImgModel(i)}
          onLoad={this.setWH}
          key={i}
          alt=""
        />
      ))
    const carouselItems =
      images &&
      images.map((r, i) => {
        return (
          <img
            key={`carousel${i}`}
            alt=""
            src={CONSTANTS.FILEADDR + r}
            className="carouselImg"
          />
        )
      })
    const carousel = (
      <Carousel
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={false}
        arrows={true}
        initialSlide={initialSlide}
      >
        {carouselItems}
      </Carousel>
    )

    // for images in detail tab
    const dataSource =
      (detail[DETAILTAB2NAME[currentTab]] &&
        detail[DETAILTAB2NAME[currentTab]].dataSource) ||
      detail[DETAILTAB2NAME[currentTab]]
    const tabCarouselItems =
      dataSource &&
      dataSource[indexOfImgDataInSource] &&
      dataSource[indexOfImgDataInSource].images &&
      dataSource[indexOfImgDataInSource].images.length > 0 &&
      dataSource[indexOfImgDataInSource].images.map((r, i) => {
        return (
          <img
            alt=""
            key={i}
            src={CONSTANTS.FILEADDR + r}
            className="carouselImg"
          />
        )
      })

    const tabCarousel = (
      <Carousel
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={false}
        arrows={true}
        initialSlide={initialSlide}
      >
        {tabCarouselItems}
      </Carousel>
    )

    const processLogs =
      logs &&
      logs.map((l, i) => {
        let { id, createTime, assignName, processorName, content, type } = l
        let message = ''
        switch (type) {
          case TASK_HANDLE_BUILD:
            message = '创建工单'
            break
          case CONSTANTS.TASK_HANDLE_REASSIGN:
            message = '转接工单' + (assignName ? `给${assignName}` : '')
            break
          case CONSTANTS.TASK_HANDLE_ACCEPT:
            message = (assignName ? assignName : '') + '接受工单'
            break
          case CONSTANTS.TASK_HANDLE_REFUSE:
            message = '拒绝工单'
            break
          case CONSTANTS.TASK_HANDLE_SENDMESSAGE:
            message = '发送客服消息给用户: ' + (content ? content : '')
            break
          case CONSTANTS.TASK_HANDLE_FINISH:
            message = '完结工单'
            break
          default:
            message = ''
        }
        return (
          <li key={`li${id}`}>
            <label key={`label${id}`} className="column">
              {createTime ? Time.getTimeStr(createTime) : ''}
            </label>
            <span key={`processor${id}`} className="column">
              {processorName}
            </span>
            <span key={`content${id}`} className="column">
              {message}
            </span>
          </li>
        )
      })

    const statusClass = status === CONSTANTS.TASK_FINISHED ? '' : 'shalowRed'

    return (
      <div
        className={
          showDetail
            ? 'taskDetailWrapper slideLeft'
            : 'taskDetailWrapper hidden'
        }
        ref="detailWrapper"
      >
        {detailLoading ? (
          <div className="task-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}
        <div className="taskDetail-header">
          <h3>工单详情</h3>
          <button className="closeBtn" onClick={this.close}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="taskDetail-content">
          <h3>
            {type ? TASKTYPE[type] : ''} {schoolName ? schoolName : ''}
          </h3>
          {type === 1 ? (
            <ul className="detailList">
              <li>
                <label>设备类型:</label>
                <span>{CONSTANTS.DEVICETYPE[deviceType]}</span>
              </li>
              <li>
                <label>设备位置:</label>
                <span>{location}</span>
              </li>
              {repairCause ? (
                <li>
                  <label>设备问题:</label>
                  <span>{repairCause}</span>
                </li>
              ) : null}
              <li className="high">
                <label>报修内容:</label>
                <span>{description}</span>
              </li>
              {imgs.length > 0 ? (
                <li className="high">
                  <label>报修图片:</label>
                  <span>{imgs}</span>
                </li>
              ) : null}
              <li>
                <label>{env === 1 ? '报修用户:' : '用户手机:'}</label>
                <span>{userMobile}</span>
              </li>
            </ul>
          ) : null}
          {type === 2 ? (
            <ul className="detailList">
              <li>
                <label>投诉类型:</label>
                <span>{CONSTANTS.COMPLAINTTYPES[orderType]}</span>
              </li>
              <li>
                <label>投诉订单:</label>
                <span>{orderNo}</span>
              </li>
              {imgs.length > 0 ? (
                <li className="high">
                  <label>投诉图片:</label>
                  <span>{imgs}</span>
                </li>
              ) : null}
              <li className="high">
                <label>投诉内容:</label>
                <span>{description}</span>
              </li>
              <li>
                <label>投诉用户:</label>
                <span>{userMobile}</span>
              </li>
            </ul>
          ) : null}
          {type === 3 ? (
            <ul className="detailList">
              <li>
                <label>反馈类型:</label>
                <span>{CONSTANTS.FEEDBACKTYPES[opt]}</span>
              </li>
              {imgs.length > 0 ? (
                <li className="high">
                  <label>反馈图片:</label>
                  <span>{imgs}</span>
                </li>
              ) : null}
              <li className="high">
                <label>反馈内容:</label>
                <span>{description}</span>
              </li>
              <li>
                <label>反馈用户:</label>
                <span>{userMobile}</span>
              </li>
            </ul>
          ) : null}

          {/* hide if env === 2, initiated by employee */}
          {type === 1 && env === 1 ? (
            <ul className="panelSelect" onClick={this.changeTabIndex}>
              <li
                data-key={1}
                className={detail_tabIndex[main_phase] === 1 ? 'active' : ''}
              >
                用户详情
              </li>
              <li
                data-key={2}
                className={detail_tabIndex[main_phase] === 2 ? 'active' : ''}
              >
                用户订单记录
              </li>
              <li
                data-key={3}
                className={detail_tabIndex[main_phase] === 3 ? 'active' : ''}
              >
                用户报修记录
              </li>
              <li
                data-key={4}
                className={detail_tabIndex[main_phase] === 4 ? 'active' : ''}
              >
                设备详情
              </li>
              <li
                data-key={5}
                className={detail_tabIndex[main_phase] === 5 ? 'active' : ''}
              >
                设备订单记录
              </li>
              <li
                data-key={6}
                className={detail_tabIndex[main_phase] === 6 ? 'active' : ''}
              >
                设备维修记录
              </li>
            </ul>
          ) : null}
          {type === 2 && env === 1 ? (
            <ul className="panelSelect" onClick={this.changeTabIndex}>
              <li
                data-key={1}
                className={detail_tabIndex[main_phase] === 1 ? 'active' : ''}
              >
                用户详情
              </li>
              <li
                data-key={7}
                className={detail_tabIndex[main_phase] === 7 ? 'active' : ''}
              >
                用户充值提现记录
              </li>
              <li
                data-key={2}
                className={detail_tabIndex[main_phase] === 2 ? 'active' : ''}
              >
                用户订单记录
              </li>
              <li
                data-key={8}
                className={detail_tabIndex[main_phase] === 8 ? 'active' : ''}
              >
                用户投诉记录
              </li>
            </ul>
          ) : null}
          {type === 3 && env === 1 ? (
            <ul className="panelSelect" onClick={this.changeTabIndex}>
              <li
                data-key={1}
                className={detail_tabIndex[main_phase] === 1 ? 'active' : ''}
              >
                用户详情
              </li>
              <li
                data-key={7}
                className={detail_tabIndex[main_phase] === 7 ? 'active' : ''}
              >
                用户充值提现记录
              </li>
              <li
                data-key={2}
                className={detail_tabIndex[main_phase] === 2 ? 'active' : ''}
              >
                用户订单记录
              </li>
              <li
                data-key={9}
                className={detail_tabIndex[main_phase] === 9 ? 'active' : ''}
              >
                用户反馈记录
              </li>
            </ul>
          ) : null}

          {env === 1 ? (
            <div className="taskDetail-panelWrapper">
              {currentTab === 1 ? (
                <ul className="detailList">
                  <li>
                    <label>手机型号:</label>
                    <span>
                      {committer && committer.mobileModel
                        ? committer.mobileModel
                        : ''}
                    </span>
                  </li>
                  <li>
                    <label>用户昵称:</label>
                    <span>
                      {committer && committer.nickName
                        ? committer.nickName
                        : ''}
                    </span>
                  </li>
                  {committer && committer.sex ? (
                    <li>
                      <label>用户性别:</label>
                      <span>{CONSTANTS.SEX[committer.sex]}</span>
                    </li>
                  ) : null}
                  <li>
                    <label>账户余额:</label>
                    <span>
                      {committer ? '¥' + (committer.balance || 0) : ''}
                    </span>
                  </li>
                  <li>
                    <label>注册时间:</label>
                    <span>
                      {committer && committer.createTime
                        ? Time.getTimeStr(committer.createTime)
                        : ''}
                    </span>
                  </li>
                </ul>
              ) : null}
              {currentTab === 2 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={committerOrder || []}
                  columns={this.committerOrderColumns}
                />
              ) : null}
              {currentTab === 3 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={committerRepair || []}
                  columns={this.committerRepairColumns}
                />
              ) : null}
              {currentTab === 4 ? (
                exist ? (
                  <ul className="detailList">
                    <li>
                      <label>绑定时间:</label>
                      <span>
                        {bindingTime ? Time.getTimeStr(bindingTime) : ''}
                      </span>
                    </li>
                    {rates || (pulse && price) ? (
                      <li>
                        <label>设备费率:</label>
                        {rateItems}
                      </li>
                    ) : null}
                    {prepayOption ? (
                      <li>
                        <label>设备预付:</label>
                        <span>
                          {prepayOption.prepay ? `¥${prepayOption.prepay}` : ''}
                        </span>
                      </li>
                    ) : null}
                    {waterTimeRange &&
                    waterTimeRange.items &&
                    waterTimeRange.items.length > 0 ? (
                      <li>
                        <label>供水时段:</label>
                        <span>{timeItem ? timeItem : ''}</span>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <ul className="detailList">
                    <li>
                      <label>绑定时间:</label>
                      <span>该设备已解绑</span>
                    </li>
                  </ul>
                )
              ) : null}
              {currentTab === 5 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={deviceOrder || []}
                  columns={this.deviceOrderColumns}
                />
              ) : null}
              {currentTab === 6 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={deviceRepair || []}
                  columns={this.deviceRepairColumns}
                />
              ) : null}
              {currentTab === 7 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={userFundRecord || []}
                  columns={this.userFundColumns}
                />
              ) : null}
              {currentTab === 8 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={
                    (userComplaints && userComplaints.dataSource) || []
                  }
                  columns={this.userComplaintsColumns}
                />
              ) : null}
              {currentTab === 9 ? (
                <Table
                  bordered
                  loading={tabLoading}
                  rowKey={record => record.id}
                  pagination={false}
                  dataSource={(userFeedbacks && userFeedbacks.dataSource) || []}
                  columns={this.userFeedbacksColumns}
                />
              ) : null}
            </div>
          ) : null}

          <div className="handleBtn">
            {/* only show when 'status' is not finished and has right to handle. */}
            {status !== CONSTANTS.TASK_FINISHED &&
            !forbiddenStatus.HANDLE_TASK ? (
              <div>
                {handleLimit !== true ? (
                  <Dropdown
                    overlay={
                      type === CONSTANTS.TASK_TYPE_REPAIR
                        ? this.reassignMenu
                        : this.reassignWithoutRepairman
                    }
                  >
                    <Button type="primary">转接</Button>
                  </Dropdown>
                ) : null}
                {handleLimit !== true ? (
                  <Button type="primary" onClick={this.finishTask}>
                    完结
                  </Button>
                ) : null}
              </div>
            ) : (
              <span>{/* span used to seize a seat */}</span>
            )}
            {currentTab === 2 ||
            currentTab === 3 ||
            currentTab === 5 ||
            currentTab === 6 ||
            currentTab === 7 ? (
              <div>
                <span className="hint">({TAB2HINT[currentTab]})</span>
                <a href="" onClick={this.goToMore}>
                  查看更多
                </a>
              </div>
            ) : null}
            {currentTab === 8 || currentTab === 9 ? (
              <div>
                <Pagination
                  current={currentTab === 8 ? complaintPage : feedbackPage}
                  pageSize={CONSTANTS.TASK_DETAIL_LIST_LENGTH}
                  total={currentTab === 8 ? complaintTotal : feedbackTotal}
                  onChange={
                    currentTab === 8
                      ? this.changeComplaintPage
                      : this.changeFeedbackPage
                  }
                />
              </div>
            ) : null}
          </div>

          {logs && logs.length > 0 ? (
            <div className="processLogs">
              <h3>处理日志</h3>
              <ul className="columnsWrapper">{processLogs}</ul>
            </div>
          ) : null}
        </div>

        <div className="taskDetail-sidebar">
          <h3>工单信息</h3>
          <ul className="detailList">
            <li>
              <label>工单编号:</label>
              <span>{id}</span>
            </li>
            <li>
              <label>发起人:</label>
              <span>{creatorName}</span>
            </li>
            {status !== CONSTANTS.TASK_PENDING ? (
              <li>
                <label>受理人:</label>
                <span>{assignName}</span>
              </li>
            ) : null}
            <li>
              <label>创建时间:</label>
              <span>{createTime ? Time.getTimeStr(createTime) : ''}</span>
            </li>
            {status !== CONSTANTS.TASK_FINISHED ? (
              <li>
                <label>等待时间:</label>
                <span>{createTime ? Time.getSpan(createTime) : null}</span>
              </li>
            ) : null}
            <li>
              <label>当前状态:</label>
              <span className={statusClass}>
                {status ? CONSTANTS.TASKSTATUS[status] : ''}
              </span>
            </li>
          </ul>

          {/* if not 'repair' type, not finished, has right to send message, show send message block. */}
          {type !== CONSTANTS.TASK_TYPE_REPAIR &&
          status !== CONSTANTS.TASK_FINISHED &&
          handleLimit !== true &&
          !forbiddenStatus.HANDLE_TASK ? (
            <div className="taskMessage">
              <h3>客服消息</h3>
              <textarea
                value={message}
                onChange={this.changeMessage}
                placeholder="可在此处发送客服消息给用户, 不超过200字"
              />
              <Button
                onClick={() => {
                  this.confirmPostMessage(id, userMobile)
                }}
                type="primary"
              >
                发送
              </Button>
              {messageError ? (
                <span className="checkInvalid">消息应为1到200个字！</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* images in task detail */}
        <Modal
          visible={showDetailImgs}
          title=""
          closable={true}
          onCancel={this.closeDetailImgs}
          className="carouselModal"
          okText=""
          footer={null}
        >
          <div className="carouselContainer">
            {showDetailImgs ? carousel : null}
          </div>
        </Modal>

        {/* images in task detail tab */}
        <Modal
          visible={showTabImg}
          title=""
          closable={true}
          onCancel={this.closeTabImgs}
          className="carouselModal"
          okText=""
          footer={null}
        >
          <div className="carouselContainer">
            {showTabImg ? tabCarousel : null}
          </div>
        </Modal>

        {/* finish task modal */}
        <Modal
          wrapClassName="modal finish"
          width={450}
          title="工单完结"
          visible={showFinishModal}
          onCancel={this.closeFinishModal}
          footer={null}
          okText=""
        >
          <div className="info buildTask">
            {type === CONSTANTS.TASK_TYPE_REPAIR ? (
              <p className="red modalTitle">
                该工单还未指派维修员处理，请告知用户原因
              </p>
            ) : null}
            <ul>
              <li>
                <p>选择标签:</p>
                <BasicSelector
                  staticOpts={tags}
                  width={150}
                  selectedOpt={tag}
                  changeOpt={this.changeTag}
                  checkOpt={this.checkTag}
                  invalidTitle="选择标签"
                />
                {tagError ? (
                  <span className="checkInvalid">请选择标签！</span>
                ) : null}
              </li>
              <li className="itemsWrapper">
                <p>备注:</p>
                <textarea
                  value={note}
                  className="longText"
                  onChange={this.changeNote}
                  placeholder="200字以内"
                />
              </li>
              {finishContentError ? (
                <span className="checkInvalid">
                  关闭维修工单时, 内容会被发给用户，不能为空！
                </span>
              ) : null}
            </ul>
            <div className="btnArea">
              <Button onClick={this.confirmFinish} type="primary">
                确认
              </Button>
              <Button onClick={this.closeFinishModal}>返回</Button>
            </div>
          </div>
        </Modal>

        {/* for repairm choose */}
        {showRepairmanModal ? (
          <RepairmanTable
            showModal={showRepairmanModal}
            confirm={this.confirmChooseRepairman}
            cancel={this.cancelChooseRepairman}
            id={id}
            level={level}
            schoolId={schoolId}
            schoolName={schoolName}
          />
        ) : null}

        {/* for custome service */}
        {showCustomerModal ? (
          <EmployeeChoose
            showModal={true}
            confirm={this.confirmChooseCustomer}
            cancel={this.cancelChooseCustomer}
            id={id}
            level={level}
            department={CONSTANTS.EMPLOYEE_CUSTOMER}
            schoolId={schoolId}
            schoolName={schoolName}
          />
        ) : null}

        {/* for developer choose */}
        {showDeveloperModal ? (
          <DepartmentChoose
            id={id}
            level={level}
            department={CONSTANTS.EMPLOYEE_DEVELOPER}
            showModal={showDeveloperModal}
            success={this.reassign2DeveloperSuccess}
            cancel={this.cancelChooseDeveloper}
          />
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  taskList: state.changeTask[subModule],
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  tags: state.setTagList
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    changeOrder,
    changeDevice,
    changeFund
  })(TaskDetail)
)
