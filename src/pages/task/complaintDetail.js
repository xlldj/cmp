import React from 'react'
import {Link} from 'react-router-dom'
import {Table, Badge, Button, Modal, Carousel, Menu, Dropdown, Radio} from 'antd'

import RangeSelect from '../component/rangeSelect'
import SearchInput from '../component/searchInput.js'
import Time from '../component/time'
import Noti from '../noti'
import AjaxHandler from '../ajax'
import CONSTANTS from '../component/constants'
import LoadingMask from '../component/loadingMask'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import CheckSelect from '../component/checkSelect'
import {checkObject} from '../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, changeOrder, changeDevice } from '../../actions'
const subModule = 'taskList'

const RadioGroup = Radio.Group

const STATUS = CONSTANTS.REPAIRSTATUS
const STATUSFORSHOW = CONSTANTS.REPAIRSTATUSFORSHOW

const TIMERANGESELECTS = {
  0: {
    1: '不限',
    2: '1天以内',
    3: '7天以内',
    4: '超过1天',
    5: '超过2天',
    6: '超过5天'
  },
  1: {
    1: '不限',
    2: '1天以内',
    3: '7天以内',
    4: '超过1天',
    5: '超过2天',
    6: '超过5天'
  },
  2: {
    1: '今天',
    2: '近3天',
    3: '近7天',
    4: '近14天',
    5: '近30天'
  }
}
const TIMELABEL = {
  0: '等待时间',
  1: '等待时间',
  2: '完结时间'
}

const TYPES = {
  2: '报修',
  1: '提现'
}
const PENDINGS = {
  1: '超过一天',
  2: '超过二天'
}
const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}
const DETAILTAB2NAME = {
  1: 'committer',
  2: 'committerOrder',
  3: 'committerRepair',
  4: 'deviceInfo',
  5: 'deviceOrder',
  6: 'deviceRepair'
}
const TABINDEX2RES = {
  1: '/user/one',
  2: '/order/list',
  3: '/repair/list',
  4: '/device/one',
  5: '/order/list',
  6: '/repair/list'
}
const DETAILTAB2JSONNAME = {
  2: 'orders',
  3: 'repairDevices',
  5: 'orders',
  6: 'repairDevices'
}

const REPAIRTABS = {
  1: '用户详情',
  2: '用户订单记录',
  3: '用户报修记录'
}
const TAB2HINT = {
  2: '用户近五笔订单',
  3: '用户近五次报修记录',
  5: '设备近五笔订单',
  6: '设备近五次维修记录'
}

const SIZE = CONSTANTS.TASK_DETAIL_LIST_LENGTH
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class ComplaintDetail extends React.Component {
  static propTypes = {
    taskList: PropTypes.object.isRequired,
  }
  constructor (props) {
    super(props)
    let dataSource = []
    this.state = { 
      dataSource, 
      loading: false,
      total: 0,
      showImgs: false,
      initialSlide: 0,
      tabLoading: false,
      level: 1,
      reassignKey: '',
      note: '',
      showReassignModal: false,
      showFinishModal: false
    }
    this.reassignMenu = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className='menuItem' >客服</span>
        </Menu.Item>
        <Menu.Item key={2}>
          <span className='menuItem' >维修员</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className='menuItem' >研发人员</span>
        </Menu.Item>
      </Menu>
    )

    this.committerOrderColumns = [{
      title: '使用设备',
      dataIndex: 'deviceType',
      width: '14%',
      render: (text,record,index) => (CONSTANTS.DEVICETYPE[record.deviceType])
    }, {
      title: '设备地址',
      dataIndex: 'location',
      width: '17%'
    }, {
      title: '开始时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.createTime)
      }
    }, {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '21%',
      render: (text,record,index) => {
        return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
      }
    }, {
      title: '使用状态',
      dataIndex: 'status',
      render: (text,record,index)=> {
        switch(record.status){
          case 1:
            return <Badge status='warning' text='使用中' />
          case 2:
            return <Badge status='success' text='使用结束' />
          case 4:
            return <Badge status='default' text='已退单' />
          case 3:
            return <Badge status='warning' text='异常' />
          default:
            return <Badge status='warning' text='异常' />
        }
      }
    }, {
      title: '消费金额',
      dataIndex: 'paymentType',
      width: '12%',
      className:'shalowRed',
      render: (text,record,index) => {
        if (record.status !== 1) {
          return `${record.consume}` || '暂无'
        } else if (record.prepay) {
          return `${record.prepay}`
        }
      }
    }]

    this.committerRepairColumns = [{
      title: '报修设备',
      dataIndex: 'deviceType',
      width: '12%',
      render: (text,record,index) => (CONSTANTS.DEVICETYPE[record.deviceType])
    }, {
      title: '报修内容',
      dataIndex: 'content',
      width: '23%'
    }, {
      title: '报修图片',
      dataIndex: 'images',
      width: '25%'
    }, {
      title: '报修时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text, record) => (Time.getTimeStr(record.createTime))
    }, {
      title: '维修状态',
      dataIndex: 'status',
      width: '19%',
      render: (text,record,index) => {
        switch(record.status){
          case 7:
            return <Badge status='success' text='维修完成' />
          case 3:
            return <Badge status='warning' text={STATUS[record.status]+`(${record.assignName})`} />
          case 4:
            return <Badge status='warning' text={STATUS[record.status]} />
          case 1:
          case 2:
          case 5:
            return <Badge status='error' text={STATUS[record.status]} />
          case 6:
            return <Badge status='error' text={STATUSFORSHOW[record.status]+`(${record.assignName})`} />
          default:
            return '已取消'
        }
      }
    }]

    this.deviceOrderColumns = [{
      title: '用户',
      dataIndex: 'username',
      width: '15%'
    }, {
      title: '手机型号',
      dataIndex: 'mobileModel',
      width: '15%'
    }, {
      title: '开始时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.createTime)
      }
    }, {
      title: '结束时间',
      dataIndex: 'finishTime',
      width: '21%',
      render: (text,record,index) => {
        return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
      }
    }, {
      title: '使用状态',
      dataIndex: 'status',
      render: (text,record,index)=> {
        switch(record.status){
          case 1:
            return <Badge status='warning' text='使用中' />
          case 2:
            return <Badge status='success' text='使用结束' />
          case 4:
            return <Badge status='default' text='已退单' />
          case 3:
            return <Badge status='warning' text='异常' />
          default:
            return <Badge status='warning' text='异常' />
        }
      }
    }, {
      title: '消费金额',
      dataIndex: 'paymentType',
      width: '12%',
      className:'shalowRed',
      render: (text,record,index) => {
        if (record.status !== 1) {
          return `${record.consume}` || '暂无'
        } else if (record.prepay) {
          return `${record.prepay}`
        }
      }
    }]

    this.deviceRepairColumns = [{
      title: '报修用户',
      dataIndex: 'committerName',
      width: '12%'
    }, {
      title: '报修内容',
      dataIndex: 'content',
      width: '23%'
    }, {
      title: '报修图片',
      dataIndex: 'images',
      width: '25%'
    }, {
      title: '报修时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text, record) => (Time.getTimeStr(record.createTime))
    }, {
      title: '维修状态',
      dataIndex: 'status',
      width: '19%',
      render: (text,record,index) => {
        switch(record.status){
          case 7:
            return <Badge status='success' text='维修完成' />
          case 3:
            return <Badge status='warning' text={STATUS[record.status]+`(${record.assignName})`} />
          case 4:
            return <Badge status='warning' text={STATUS[record.status]} />
          case 1:
          case 2:
          case 5:
            return <Badge status='error' text={STATUS[record.status]} />
          case 6:
            return <Badge status='error' text={STATUSFORSHOW[record.status]+`(${record.assignName})`} />
          default:
            return '已取消'
        }
      }
    }]
  }
  componentDidMount(){
    // this.props.hide(false)
  }
  componentWillUnmount () {
    // this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    try {
      let {main_phase, 
        panel_page, panel_dataSource, 
        details, detail_tabIndex, showDetail, selectedRowIndex, detailLoading
      } = nextProps.taskList
      let page = panel_page[main_phase]

      // only care detail related props
      console.log(this.props.taskList)
      console.log(nextProps.taskList)
      if (showDetail && !checkObject(this.props.taskList, nextProps.taskList, [
        'detail_tabIndex', 'selectedRowIndex', 'detailLoading'
      ])) {
        // get selected item.
        let selectedItem = panel_dataSource[main_phase][page] && panel_dataSource[main_phase][page][selectedRowIndex] // selected row
        let type = '', id = '', detail
        if (selectedItem) { // if not, it will be fetched in task/list
          type = selectedItem[type] || 2
          id = selectedItem[id] || 1
          // if type is not 'repair', break.
          if (type !== 2) {
            return
          }
          if (details[id]) { // if not , fetch it in task/list
            let detail = details[id]
            console.log(detail)
            let tabIndex = detail_tabIndex[main_phase]
            let key = DETAILTAB2NAME[tabIndex]
            if (detail.hasOwnProperty(key)) {
              // nothing
            } else {
              let resource = TABINDEX2RES[tabIndex]
              let userId = detail.content.committerId || 0
              let residenceId = detail.device.residenceId || 0
              let deviceType = detail.device.deviceType
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
                body.userId = userId
                body.status = [1, 2, 3, 4, 6, 7]
              } else if (tabIndex === 4) {
                // body.
                if (deviceType === 2) {
                  resource = '/device/water/one'
                  body.id = residenceId
                } else {
                  resource = '/device/query/one'
                  body.id = id
                }
              } else if (tabIndex === 5) {
                body.page = 1
                body.size = SIZE
                body.residenceId = deviceType
                body.deviceType = residenceId
              } else if (tabIndex === 6) {
                body.page = 1
                body.size = SIZE
                body.residenceId = residenceId
                body.deviceType = deviceType
                body.status = [1, 2, 3, 4, 6, 7]
              }
              const cb = (json) => {
                let jsonDataName = DETAILTAB2JSONNAME[tabIndex], data = {}
                if (tabIndex === 1 || tabIndex === 4) {
                  data = json.data
                } else {
                  data = json.data[jsonDataName]
                }
                let newDetails = JSON.parse(JSON.stringify(details))
                newDetails[id][key] = data
                this.props.changeTask(subModule, {
                  details: newDetails
                })
              }
              AjaxHandler.ajax(resource, body, cb)

              // set state
              let nextState = {}
              if (userId && (userId !== this.state.userId)) {
                nextState.userId = userId
              }
              if (deviceType && deviceType !== this.state.deviceType) {
                nextState.deviceType = deviceType
              }
              if (residenceId && residenceId !== this.state.residenceId) {
                nextState.residenceId = residenceId
              }
              this.setState(nextState)
            }
          }
        }
      }
      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }
  changeDivision = (v)=> {
    let {all} = this.state
    if (v !== all) {
      this.props.changeTask(subModule, {'all': v, 'page': 1})
    }
  }
  changeType = (v) => {
    let {type} = this.props
    if (type !== v) {
      this.props.changeTask(subModule, {'sourceType': v, 'page': 1})
    }
  }
  changePending = (v) => {
    let {assigned} = this.props
    if (v !== assigned) {
      this.props.changeTask(subModule, {'pending': v, page: 1})
    }
  }
  toNa = (e) => {
    e.preventDefault()
    let {assigned} = this.props
    if (assigned) {
      this.props.changeTask(subModule, {'assigned': false, page: 1})
    }
  }
  toAssigned = (e) => {
    e.preventDefault()
    let {assigned} = this.props
    if (!assigned) {
      this.props.changeTask(subModule, {'assigned': true, page: 1})
    }
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeTask(subModule, {'page': page})
  }
  changeSchool = (v) => {
    let {schoolId} = this.props
    if (v === schoolId) {
      return
    }
    this.props.changeTask(subModule, {'schoolId': v})
  }
  changePhase = (e) => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      let {main_phase} = this.props.taskList
      if (main_phase !== key) {
        this.props.changeTask(subModule, {main_phase: key})
      }
    } catch (e) {
      console.log(e)
    }
  }
  close = (e) => {
    this.props.changeTask(subModule, {selectedRowIndex: -1, showDetail: false})
  }

  showModel = (i) => {
    this.setState({
      initialSlide: i,
      showImgs: true
    })
  }
  setWH = (e) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = '50px'
    } else {
      img.style.height = '50px'
    }
  }
  changeTabIndex = (e) => {
    try {
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      if (key) {
        let {main_phase, detail_tabIndex} = this.props.taskList
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
  reassign = (m) => {
    try {
      let {key} = m
      this.setState({
        reassignKey: key,
        showReassignModal: true
      })
    } catch (e) {
      console.log(e)
    }
  }
  changeUrgencyLevel = (e) => {
    this.setState({
      level: e.target.value
    })
  }
  changeNote = (e) => {
    this.setState({
      note: e.target.value
    })
  }
  confirmReassign = () => {
    let {id, note, level, reassignKey} = this.state
    let resource = '/work/order/handle'
    const body = {
      id: id,
      type: 3, // reassign
      level: level
    }
    // role
    if (reassignKey) {
      body.role = reassignKey
    }
    let content = note.trim()
    if (content) {
      body.content = content
    }
    const cb = (json) => {
      if (json.data.result) {
        // success
        this.setState({
          reassignKey: '',
          showReassignModal: false,
          note: ''
          // level: originalLevel
        })
      } else {
        Noti.hintWarning('', json.data.failReason || '转接失败，请稍后重试')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  closeReassignModal = () => {
    this.setState({
      // level: originalLevel, // set level to original value
      note: '',
      showReassignModal: false,
      reassignKey: ''
    })
  }
  finishTask = () => {
    this.setState({
      showFinishModal: true
    })
  }
  confirmFinish = () => {
    let {id, note} = this.state
    let resource = '/work/order/handle'
    const body = {
      id: id,
      type: 8 // finish 
    }
    let content = note.trim()
    if (content) {
      body.content = content
    }
    const cb = (json) => {
      if (json.data.result) {
        // success
        this.setState({
          showFinishModal: false,
          note: ''
        })
      } else {
        Noti.hintWarning('', json.data.failReason || '操作失败，请稍后重试')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  closeFinishModal = () => {
    this.setState({
      note: '',
      showFinishModal: false
    })
  }
  goToMore = (e) => {
    e.preventDefault()
    let {userId, deviceType, residenceId} = this.state
    console.log(userId)
    let {main_phase,panel_page, panel_dataSource, 
      details, showDetail, selectedRowIndex, detailLoading, detail_tabIndex
    } = this.props.taskList

    let currentTab = detail_tabIndex[main_phase]
    if (currentTab === 2) {
      this.props.changeOrder('orderList', 
        {
          page: 1, schoolId: 'all', deviceType: 'all', status: 'all', 
          selectKey: ''
        }
      )
      this.props.history.push({pathname: '/order/list', state: {path: 'fromTask', userId: userId}})
    } else if (currentTab === 3) {
      this.props.changeDevice('repair', 
        {
          page: 1, schoolId: 'all', deviceType: 'all', status: 'all'
        }
      )
      this.props.history.push({pathname: '/device/repair', state: {path: 'fromTask', userId: userId}})
    } else if (currentTab === 5) {
      this.props.changeOrder('orderList', 
        {
          page: 1, schoolId: 'all', deviceType: deviceType.toString(), status: 'all', 
          selectKey: ''
        }
      )
      this.props.history.push({pathname: '/order/list', state: {path: 'fromTask', deviceType: deviceType, residenceId: residenceId}})
    } else if (currentTab === 6) {
      this.props.changeDevice('repair', 
        {
          page: 1, schoolId: 'all', deviceType: 'all', status: 'all'
        }
      )
      this.props.history.push({pathname: '/device/repair', state: {path: 'fromTask', deviceType: deviceType, residenceId: residenceId}})
    }
  }
  render () {

    const {showImgs, initialSlide, tabLoading, showReassignModal, note, level, showFinishModal} = this.state

    let {main_phase,panel_page, panel_dataSource, 
      details, showDetail, selectedRowIndex, detailLoading, detail_tabIndex
    } = this.props.taskList

    let currentTab = detail_tabIndex[main_phase]

    /* get info from 'details', 'details' is an object whose key is 'id' */
    // get type and id
    let page = panel_page[main_phase]
    let selectedItem = panel_dataSource[main_phase][page] && panel_dataSource[main_phase][page][selectedRowIndex] // selected row
    let id = '', detail = {}
    if (selectedItem) {
      id = selectedItem[id] || 1
      if (id) {
        detail = details[id] || {} // info of current selected item
      }
    }
    let {committer, committerOrder, committerRepair, deviceInfo, deviceOrder, deviceRepair,
      content, device
    } = detail
    let {deviceType, location} = device || {}
    let {cause, images, committerName} = content || {}
    let {bindingTime, rate, prepay, timeset} = deviceInfo || {}
    console.log(committer)
    const imgs = images && images.map((r, i) => (
    // const imgs = [1, 2].map((r, i) => (
      <img  
        // src='http://img02.sogoucdn.com/app/a/100520020/95cbca3276545c38a65f7827fc56b951' 
        src={CONSTANTS.FILEADDR + r}
        onClick={() => this.showModel(i)} 
        onLoad={this.setWH} 
        key={i} alt='' 
      />
    ))

    const carouselItems = images && images.map((r,i) => {
      return <img key={`carousel${i}`} alt='' src={CONSTANTS.FILEADDR + r} className='carouselImg' />
    })

    const carousel = (
      <Carousel dots={true} accessibility={true}  className='carouselItem' 
        autoplay={false} arrows={true} initialSlide={initialSlide} >
        {carouselItems}
      </Carousel>
    )


    return (
      <div 
        className={showDetail ? 'taskDetailWrapper slideLeft' : 'taskDetailWrapper hidden'} 
        ref='detailWrapper'
        // onClick={this.wrapperClicked}
      >
        {detailLoading ? 
          <div className='task-loadWrapper'>
            <LoadingMask
            />
          </div>
          : null
        }
        <div className='taskDetail-header'>
          <h3>工单详情</h3>
          <button className='closeBtn' onClick={this.close}>X</button>
        </div>

        <div className='taskDetail-content'>
          <h3>报修工单 </h3>
          <ul className='detailList'>
            <li><label>设备类型:</label><span>{CONSTANTS.DEVICETYPE[deviceType]}</span></li>
            <li><label>设备位置:</label><span>{location}</span></li>
            <li><label>设备问题:</label><span></span></li>
            <li className='high'><label>报修内容:</label><span>指定修改的开始位置（从0计数）。如果超出了数组的长度，则从数组末尾开始添加内容；如果是负值，则表示从数组末位开始的第几位（从1计数）；若只使用start参数而不使用deleteCount、item，如：array.splice(start) ，表示删除[start，end]的元素。</span></li>
            <li className='high'><label>报修图片:</label><span>{imgs}</span></li>
            <li><label>报修用户:</label><span>{committerName}</span></li>
          </ul>

          <ul className='panelSelect' onClick={this.changeTabIndex}>
            <li data-key={1} className={detail_tabIndex[main_phase] === 1 ? 'active' : ''}>用户详情</li>
            <li data-key={2} className={detail_tabIndex[main_phase] === 2 ? 'active' : ''}>用户订单记录</li>
            <li data-key={3} className={detail_tabIndex[main_phase] === 3 ? 'active' : ''}>用户报修记录</li>
            <li data-key={4} className={detail_tabIndex[main_phase] === 4 ? 'active' : ''}>设备详情</li>
            <li data-key={5} className={detail_tabIndex[main_phase] === 5 ? 'active' : ''}>设备订单记录</li>
            <li data-key={6} className={detail_tabIndex[main_phase] === 6 ? 'active' : ''}>设备维修记录</li>
          </ul>

          <div className='taskDetail-panelWrapper'>
            {currentTab === 1 ?
                <ul className='detailList'>
                  <li><label>手机型号:</label><span>{committer && committer.mobileModel ? committer.mobileModel : ''}</span></li>
                  <li><label>用户昵称:</label><span>{committer && committer.nickName ? committer.nickName : ''}</span></li>
                  <li><label>用户性别:</label><span>{committer && committer.sex? CONSTANTS.SEX[committer.mobileModel] : ''}</span></li>
                  <li><label>账户余额:</label><span>{committer && committer.balance ? committer.balance : ''}</span></li>
                  <li><label>注册时间:</label><span>{committer && committer.createTime ? Time.getTimeStr(committer.createTime) : ''}</span></li>
                </ul>
              : null
            }
            {currentTab === 2 ? 
                <Table 
                  bordered 
                  loading={tabLoading}
                  rowKey={(record)=>(record.id)} 
                  // pagination={{pageSize: SIZE, current: this.props.page, total: total}}  
                  pagination={false}
                  dataSource={committerOrder || []} 
                  columns={this.committerOrderColumns} 
                  // onChange={this.changePage}
                />
              : null
            }
            {currentTab === 3 ?
                <Table
                  bordered 
                  loading={tabLoading}
                  rowKey={(record)=>(record.id)} 
                  // pagination={{pageSize: SIZE, current: this.props.page, total: total}}  
                  pagination={false}
                  dataSource={committerRepair || []} 
                  columns={this.committerRepairColumns} 
                  // onChange={this.changePage}
                />
              : null
            }
            {currentTab === 4 ?
                <ul className='detailList'>
                  <li><label>绑定时间:</label><span>{bindingTime ? Time.getTimeStr(bindingTime) : ''}</span></li>
                  <li><label>设备费率:</label><span>{rate ? rate : ''}</span></li>
                  <li><label>设备预付:</label><span>{prepay ? prepay : ''}</span></li>
                  <li><label>供水时段:</label><span>{timeset ? timeset : ''}</span></li>
                </ul>
              : null
            }
            {currentTab === 5 ?
                <Table 
                  bordered 
                  loading={tabLoading}
                  rowKey={(record)=>(record.id)} 
                  // pagination={{pageSize: SIZE, current: this.props.page, total: total}}  
                  pagination={false}
                  dataSource={deviceOrder || []} 
                  columns={this.deviceOrderColumns} 
                  // onChange={this.changePage}
                />
              : null
            }
            {currentTab === 6 ?
                <Table
                  bordered 
                  loading={tabLoading}
                  rowKey={(record)=>(record.id)} 
                  // pagination={{pageSize: SIZE, current: this.props.page, total: total}}  
                  pagination={false}
                  dataSource={deviceRepair || []} 
                  columns={this.deviceRepairColumns} 
                  // onChange={this.changePage}
                />
              : null
            }
          </div>

          <div className='handleBtn'>
            <div className='btnArea'>
              <Dropdown overlay={this.reassignMenu}>
                <Button type='primary'>转接</Button>
              </Dropdown>
              <Button type='primary' onClick={this.finishTask}>完结</Button>
            </div>
            {currentTab === 2 || currentTab === 3 || currentTab === 5 || currentTab === 6 ?
                <div>
                  <span className='hint'>({TAB2HINT[currentTab]})</span>
                  <a href='' onClick={this.goToMore} >查看更多</a>
                </div>
              : null
            }
          </div>

          <div className='processLogs'>
            <h3>处理日志</h3>
            <ul className='columnsWrapper'>
              <li>
                <label className='column'>2017-11-12</label>
                <span className='column'>客服大帝</span>
                <span className='column'>转接工单给李元芳</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='taskDetail-sidebar'>
          <h3>工单信息</h3>
          <ul className='detailList'>
            <li><label>工单编号:</label></li>
            <li><label>发起人:</label></li>
          </ul>
        </div>

        <Modal visible={showImgs}  title='' closable={true} onCancel={this.closeImgs}  className='carouselModal' okText='' footer={null} >
          <div className='carouselContainer' >{ showImgs ? carousel : null}</div>
        </Modal>

        <Modal
          wrapClassName='modal reassign'
          width={330}
          title='工单转接'
          visible={showReassignModal}
          onCancel={this.closeReassignModal}
          footer={null}
          okText=''
        >
          <div className='info buildTask'>
            <ul>
              <li>
                <p>紧急程度:</p>
                <RadioGroup value={level} onChange={this.changeUrgencyLevel} >
                  <Radio value={1}>普通</Radio>
                  <Radio value={2}>优先</Radio>
                  <Radio value={3}>紧急</Radio>
                </RadioGroup>
              </li>
              <li className='itemsWrapper'>
                <p>备注:</p>
                <textarea
                  value={note}
                  className='longText'
                  onChange={this.changeNote}
                />
              </li>
            </ul>
          <div className='btnArea'>
            <Button onClick={this.confirmReassign} type='primary'>确认</Button>
            <Button onClick={this.closeReassignModal} >返回</Button>
          </div>
          </div>
        </Modal>

        <Modal
          wrapClassName='modal finish'
          width={290}
          title='工单完结'
          visible={showFinishModal}
          onCancel={this.closeFinishModal}
          footer={null}
          okText=''
        >
          <div className='info buildTask'>
            <ul>
              <li className='itemsWrapper'>
                <p>备注:</p>
                <textarea
                  value={note}
                  className='longText'
                  onChange={this.changeNote}
                />
              </li>
            </ul>
          <div className='btnArea'>
            <Button onClick={this.confirmFinish} type='primary'>确认</Button>
            <Button onClick={this.closeFinishModal} >返回</Button>
          </div>
          </div>
        </Modal>

      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  taskList: state.changeTask[subModule]
})

export default withRouter(connect(mapStateToProps, {
  changeTask,
  changeOrder,
  changeDevice
})(ComplaintDetail))