import React, { Fragment } from 'react'
import { Table, Button, Popconfirm, Modal } from 'antd'

import ProgressBar from '../../component/progressBar'
import RangeSelect from '../../component/rangeSelect'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import CheckSelect from '../../component/checkSelect'
import { checkObject } from '../../../util/checkSame'
import Noti from '../../../util/noti'
import Time from '../../../util/time'
import notworking from '../../assets/notworking.jpg'
import { mul, div } from '../../../util/numberHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeTask,
  setUserInfo,
  setTagList,
  changeOnline
} from '../../../actions'
const subModule = 'report'
const DATANAME = {
  1: 'workReports',
  2: 'tags',
  3: 'workAssesses'
}
const {
  REPORT_CATE_SUM,
  REPORT_CATE_COMPLAINT,
  REPORT_CATE_ASSESS,
  REPORT_ASSESS_TYPE,
  ASSESS_SCHOOL,
  ASSESS_CUSTOM,
  ASSESS_REPAIRMAN,
  ORDER,
  ORDERBYS
} = CONSTANTS
const SIZE = CONSTANTS.PAGINATION

const TIMERANGESELECTS = {
  1: '今日',
  2: '近3天',
  3: '近7天',
  5: '近30天'
}
const TIMELABEL = {
  0: '等待时间',
  1: '等待时间',
  2: '完结时间'
}

/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskReport extends React.Component {
  static propTypes = {
    report: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      startTime: '',
      endTime: '',
      note: '',
      noteError: false,
      tagExistError: false,
      searchingText: '',
      showBuildTag: false,
      tagLengthError: false,
      tagId: ''
    }
    this.sumColumns = [
      {
        title: '客服工作情况',
        children: [
          {
            title: '名字',
            dataIndex: 'name',
            width: '10%'
          },
          {
            title: '学校',
            dataIndex: 'schoolName',
            width: '17%',
            render: (text, record) =>
              record.schoolNames ? record.schoolNames.join('、') : ''
          },
          {
            title: '当前状态',
            dataIndex: 'status',
            render: (text, record) => (record.status ? '在线' : '离线')
          },
          {
            title: '待处理工单',
            dataIndex: 'pending',
            width: '10%'
          },
          {
            title: '处理中工单',
            dataIndex: 'processing',
            width: '10%'
          },
          {
            title: '已完结工单',
            dataIndex: 'finished',
            width: '10%'
          },
          {
            title: '平均响应时长',
            dataIndex: 'responseTime',
            width: '10%',
            render: (text, record) =>
              record.responseTime ? Time.formatSpan(record.responseTime) : 0
          },
          {
            title: '发送客服消息数量',
            dataIndex: 'send',
            width: '13%'
          },
          {
            title: '创建工单数量',
            dataIndex: 'create',
            width: '10%'
          }
        ]
      }
    ]
    this.assessSchoolColumns = [
      {
        title: <span className="leftHeader">学校考核</span>,
        children: [
          {
            title: '学校',
            dataIndex: 'name',
            width: '8%'
          }
        ]
      },
      {
        title: '客服',
        children: [
          {
            title: '已完成工单量',
            dataIndex: 'schoolCsFinished',
            orderBy: 'csFinished',
            width: '8%',
            render: (text, record) =>
              record.csWorkAssess && record.csWorkAssess.finished
                ? record.csWorkAssess.finished
                : 0,
            sorter: true
          },
          {
            title: '创建工单量',
            dataIndex: 'build',
            width: '8%',
            render: (text, record) =>
              record.csWorkAssess && record.csWorkAssess.create
                ? record.csWorkAssess.create
                : 0
          },
          {
            title: '平均响应时长',
            dataIndex: 'schoolCsResponseTime',
            orderBy: 'csResponseTime',
            width: '8%',
            render: (text, record) =>
              record.csWorkAssess && record.csWorkAssess.responseTime
                ? Time.formatSpan(record.csWorkAssess.responseTime)
                : 0,
            sorter: true
          },
          {
            title: '指派成功率',
            dataIndex: 'success',
            width: '8%',
            render: (text, record) =>
              record.csWorkAssess && record.csWorkAssess.success
                ? record.csWorkAssess.success + '%'
                : 0
          }
        ]
      },
      {
        title: '维修员',
        children: [
          {
            title: '已完成工单量',
            dataIndex: 'schoolRepairFinished',
            orderBy: 'repairFinished',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess && record.repairmanWorkAssess.finished
                ? record.repairmanWorkAssess.finished
                : 0,
            sorter: true
          },
          {
            title: '一天内完成率',
            dataIndex: 'schoolRatioInOne',
            orderby: 'ratioInOne',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.finishedRate
                ? `${record.repairmanWorkAssess.finishedRate}%`
                : 0,
            sorter: true
          },
          {
            title: '平均响应时长',
            dataIndex: 'schoolRepairResponseTime',
            orderBy: 'repairResponseTime',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.responseTime
                ? Time.formatSpan(record.repairmanWorkAssess.responseTime)
                : 0,
            sorter: true
          },
          {
            title: '平均维修时长',
            dataIndex: 'schoolRepairTime',
            orderBy: 'repairTime',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.repairTime
                ? Time.formatSpan(record.repairmanWorkAssess.repairTime)
                : 0,
            sorter: true
          },
          {
            title: '二次维修次数',
            dataIndex: 'schoolRepairSecondRepair',
            orderby: 'repairSecondRepair',
            width: '8%',
            render: (text, record) =>
              (record.repairmanWorkAssess &&
                record.repairmanWorkAssess.second) ||
              0,
            sorter: true
          },
          {
            title: '用户评价',
            dataIndex: 'schoolRepairRating',
            orderBy: 'repairRating',
            width: '8%',
            render: (text, record) =>
              (record.repairmanWorkAssess &&
                record.repairmanWorkAssess.rating) ||
              0,
            sorter: true
          }
        ]
      }
    ]
    this.assessCustomColumns = [
      {
        title: <span className="leftHeader">客服考核</span>,
        children: [
          {
            title: '姓名',
            dataIndex: 'name',
            width: '8%'
          },
          {
            title: '学校',
            dataIndex: 'schoolName',
            width: '10%',
            render: (text, record) => {
              return record.schoolNames ? record.schoolNames.join('、') : ''
            }
          },
          {
            title: '已完成工单量',
            dataIndex: 'csFinished',
            width: '8%',
            render: (text, record) => record.csWorkAssess.finished,
            sorter: true
          },
          {
            title: '平均响应时长',
            dataIndex: 'csResponseTime',
            width: '8%',
            render: (text, record) =>
              record.csWorkAssess && record.csWorkAssess.responseTime
                ? Time.formatSpan(record.csWorkAssess.responseTime)
                : 0,
            sorter: true
          },
          {
            title: '创建工单量',
            dataIndex: 'build',
            width: '8%',
            render: (text, record) => record.csWorkAssess.create
          },
          {
            title: '指派成功率',
            dataIndex: 'success',
            width: '8%',
            render: (text, record) => record.csWorkAssess.success + '%'
          },
          {
            title: '发送客服消息数量',
            dataIndex: 'send',
            width: '8%',
            render: (text, record) => record.csWorkAssess.send
          }
        ]
      }
    ]
    this.assessRepairmanColumns = [
      {
        title: <span className="leftHeader">维修员考核</span>,
        children: [
          {
            title: '姓名',
            dataIndex: 'name',
            width: '8%'
          },
          {
            title: '学校',
            dataIndex: 'schools',
            width: '10%',
            render: (text, record) =>
              record.schoolNames ? record.schoolNames.join('、') : ''
          },
          {
            title: '已完成工单量',
            dataIndex: 'repairFinished',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.finished,
            sorter: true
          },
          {
            title: '一天内完成率',
            dataIndex: 'ratioInOne',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.finishedRate
                ? `${record.repairmanWorkAssess.finishedRate}%`
                : 0,
            sorter: true
          },
          {
            title: '平均响应时长',
            dataIndex: 'repairResponseTime',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.responseTime
                ? Time.formatSpan(record.repairmanWorkAssess.responseTime)
                : 0,
            sorter: true
          },
          {
            title: '平均维修时长',
            dataIndex: 'repairTime',
            width: '8%',
            render: (text, record) =>
              record.repairmanWorkAssess &&
              record.repairmanWorkAssess.repairTime
                ? Time.formatSpan(record.repairmanWorkAssess.repairTime)
                : 0,
            sorter: true
          },
          {
            title: '二次维修次数',
            dataIndex: 'repairSecondRepair',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.second,
            sorter: true
          },
          {
            title: '用户评价(5分)',
            dataIndex: 'repairRating',
            width: '8%',
            render: (text, record) => record.repairmanWorkAssess.rating,
            sorter: true
          }
        ]
      }
    ]
  }

  // fetch task/list
  fetchReports = (resource, body, cate) => {
    const cb = json => {
      console.log(json.data)
      let nextState = {
        loading: false,
        total: json.data.total
      }
      let data = json.data[DATANAME[cate]]
      /*
      if (cate === REPORT_CATE_SUM) {
        data = json.data.workReports;
      } else if (cate === REPORT_CATE_ASSESS) {
        data = json.data.workAssesses;
      } else if (cate === REPORT_CATE_COMPLAINT) {
        data = json.data.tags;
      }
      */
      nextState.dataSource = data
      this.setState(nextState)
    }
    this.setState({
      loading: true,
      dataSource: []
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      clearLoading: true,
      thisObj: this
    })
  }
  componentDidMount() {
    this.props.hide(false)
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      panel_page,
      assess_dim,
      order,
      orderBy
    } = this.props[subModule]

    // fetch reports
    let page = panel_page[mainCate]
    let startTime = panel_startTime[mainCate],
      endTime = panel_endTime[mainCate],
      day = panel_rangeIndex[mainCate]

    // set startTime and endTime if props has no-empty value
    if (panel_startTime[mainCate] && panel_endTime[mainCate]) {
      this.setState({
        startTime: panel_startTime[mainCate],
        endTime: panel_endTime[mainCate]
      })
    }
    // if customer is offline, wait until online to fetch.
    let { csOnline, isCs } = this.props.user
    if (!csOnline && isCs) {
      return
    }
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (day !== 0) {
      // 0 means selected startTime and endTime
      body.day = day
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    }
    if (mainCate === REPORT_CATE_ASSESS - 1 && orderBy[assess_dim - 1] !== 0) {
      body.order = order[assess_dim - 1]
      body.orderBy = orderBy[assess_dim - 1]
    }

    let resource = '/work/condition/list'
    if (mainCate === REPORT_CATE_ASSESS - 1) {
      resource = '/work/condition/assess/list'
      body.lat = assess_dim
    } else if (mainCate === REPORT_CATE_COMPLAINT - 1) {
      resource = '/work/order/tag/stat/list'
    }

    this.fetchReports(resource, body, mainCate + 1)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    /* distinguish data fetch of 'list' from 'detail' , or else it will cause mutual chaos. */
    try {
      let {
        mainCate,
        schoolId,
        panel_rangeIndex,
        panel_startTime,
        panel_endTime,
        panel_page,
        assess_dim,
        order,
        orderBy
      } = nextProps[subModule]

      // update state.startTime to props.startTime
      let startTime = panel_startTime[mainCate],
        endTime = panel_endTime[mainCate]
      let nextState = {}
      if (startTime !== this.state.startTime) {
        nextState.startTime = startTime
      }
      if (endTime !== this.state.endTime) {
        nextState.endTime = endTime
      }
      this.setState(nextState)

      // Check props to determine if need to fetch.
      // Fetch also when csOnline changed to 'true' from 'false'
      if (
        !checkObject(this.props[subModule], nextProps[subModule], [
          'mainCate',
          'schoolId',
          'panel_rangeIndex',
          'panel_startTime',
          'panel_endTime',
          'panel_page',
          'assess_dim',
          'order',
          'orderBy'
        ]) ||
        (nextProps.user.csOnline && !this.props.user.csOnline)
      ) {
        let page = panel_page[mainCate]
        let day = panel_rangeIndex[mainCate]
        const body = {
          page: page,
          size: SIZE
        }
        if (schoolId !== 'all') {
          body.schoolId = parseInt(schoolId, 10)
        }
        if (day !== 0) {
          body.day = day
        }
        if (startTime && endTime) {
          body.startTime = startTime
          body.endTime = endTime
        }
        if (
          mainCate === REPORT_CATE_ASSESS - 1 &&
          orderBy[assess_dim - 1] !== 0
        ) {
          body.order = order[assess_dim - 1]
          body.orderBy = orderBy[assess_dim - 1]
        }

        let resource = '/work/condition/list'
        if (mainCate === REPORT_CATE_ASSESS - 1) {
          resource = '/work/condition/assess/list'
          body.lat = assess_dim
        } else if (mainCate === REPORT_CATE_COMPLAINT - 1) {
          resource = '/work/order/tag/stat/list'
        }
        this.fetchReports(resource, body, mainCate + 1)
      }

      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }

  changeCate = e => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      let { mainCate } = this.props[subModule]
      if (mainCate !== key) {
        this.props.changeTask(subModule, { mainCate: key })
      }
    } catch (e) {
      console.log(e)
    }
  }

  changeSchool = v => {
    let { schoolId } = this.props[subModule]
    if (v === schoolId) {
      return
    }
    this.props.changeTask(subModule, {
      schoolId: v,
      panel_page: [1, 1, 1]
    })
  }

  changeRange = key => {
    let panel_rangeIndex = this.props[subModule]['panel_rangeIndex'].slice()
    let i = this.props[subModule].mainCate
    console.log(i)
    if (panel_rangeIndex[i] === key) {
      return
    }

    let panel_page = this.props[subModule]['panel_page'].slice()
    let startTime = this.props[subModule]['panel_startTime'].slice()
    let endTime = this.props[subModule]['panel_endTime'].slice()

    panel_rangeIndex[i] = parseInt(key, 10)
    panel_page[i] = 1
    // clear startTime and endTime
    startTime[i] = ''
    endTime[i] = ''
    this.props.changeTask(subModule, {
      panel_rangeIndex: panel_rangeIndex,
      panel_page: panel_page,
      panel_startTime: startTime,
      panel_endTime: endTime
    })
  }

  changeAssessDim = key => {
    console.log(key)
    let { assess_dim } = this.props[subModule]
    if (assess_dim === key) {
      return
    }
    this.props.changeTask(subModule, {
      assess_dim: key
    })
  }
  changeStartTime = time => {
    this.setState({
      startTime: time
    })
  }
  changeEndTime = time => {
    this.setState({
      endTime: time
    })
  }
  confirmTimeRange = () => {
    let { startTime, endTime } = this.state
    if (!startTime || !endTime) {
      return
    }
    let panel_startTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_startTime)
    )
    let panel_endTime = JSON.parse(
      JSON.stringify(this.props[subModule].panel_endTime)
    )
    let panel_page = this.props[subModule].panel_page.slice()
    let panel_rangeIndex = this.props[subModule].panel_rangeIndex.slice()
    // let panel_total = JSON.parse(JSON.stringify(this.props[subModule].panel_total))
    let i = this.props[subModule].mainCate
    panel_startTime[i] = startTime
    panel_endTime[i] = endTime
    panel_page[i] = 1
    panel_rangeIndex[i] = 0
    this.props.changeTask(subModule, {
      panel_startTime: panel_startTime,
      panel_endTime: panel_endTime,
      panel_page: panel_page,
      panel_rangeIndex: panel_rangeIndex
    })
  }

  changeTable = (pageObj, filters, sorter) => {
    console.log(sorter)
    let { order, field, column } = sorter
    let { orderBy, assess_dim } = this.props[subModule]
    let data = {}
    let newOrder = Array.from(this.props[subModule].order),
      newOrderBy = Array.from(orderBy)
    if (order) {
      newOrder[assess_dim - 1] = ORDER[order]
      newOrderBy[assess_dim - 1] =
        ORDERBYS[column.orderBy ? column.orderBy : field]
      data.order = newOrder
      data.orderBy = newOrderBy
    } else if (orderBy[assess_dim - 1] !== 0) {
      newOrderBy[assess_dim - 1] = 0
      data.orderBy = newOrderBy
    }
    let page = pageObj.current
    let { panel_page, mainCate } = this.props[subModule]
    let former = panel_page[mainCate]
    if (former !== page) {
      let newPage = Array.from(panel_page)
      newPage.splice(mainCate, 1, page)
      data.panel_page = newPage
    }
    this.props.changeTask(subModule, data)
  }

  addTag = () => {
    this.setState({
      showBuildTag: true
    })
  }
  cancelBuildTag = () => {
    this.setState({
      showBuildTag: false,
      note: '',
      originalTag: '',
      tagId: '',
      noteError: false,
      tagExistError: false,
      tagLengthError: false
    })
  }
  buildTagSuccess = () => {
    Noti.hintOk('操作成功', '创建标签成功')
    this.setState({
      showBuildTag: false
    })
    this.updateList()
  }
  changeNote = e => {
    let v = e.target.value
    this.setState({
      note: v,
      tagLengthError: false,
      tagExistError: false,
      noteError: false
    })
  }
  checkNote = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        noteError: true,
        note: v
      })
    }
    if (v.length > 10) {
      return this.setState({
        tagLengthError: true,
        note: v
      })
    }
    if (this.state.noteError) {
      this.setState({
        noteError: false,
        note: v
      })
    }
  }
  confirmBuildTag = () => {
    let { tagId, note, posting, checking, originalTag } = this.state
    let description = note.trim()
    if (!description) {
      return this.setState({
        noteError: true
      })
    }
    if (description.length > 10) {
      return this.setState({
        tagLengthError: true
      })
    }
    console.log('build', posting, checking)
    if (posting || checking) {
      return
    }

    if (tagId && description === originalTag) {
      // nothing changed
      return this.setState({
        showBuildTag: false,
        tagId: '',
        originalTag: '',
        note: ''
      })
    } else {
      this.checkExist(this.postTag)
    }
  }
  checkExist = callback => {
    let { note, checking } = this.state
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let description = note.trim()
    let resource = '/work/order/tag/check'
    const body = {
      description: description
    }
    const cb = json => {
      const nextState = {
        checking: false
      }
      if (json.error) {
        this.hintError()
      } else {
        if (json.data.result) {
          Noti.hintLock('请求出错', '该标签已被添加！')
          this.setState({
            tagExistError: true
          })
        } else {
          if (this.state.tagExistError) {
            nextState.tagExistError = false
          }
          if (callback) {
            callback()
          }
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearChecking: true,
      thisObj: this
    })
  }
  editTag = (e, id) => {
    e.preventDefault()
    let data = this.state.dataSource.find(d => d.id === +id)
    let { description } = data
    this.setState({
      tagId: +id,
      note: description,
      originalTag: description,
      showBuildTag: true
    })
  }
  deleteTag = (e, id) => {
    let resource = '/work/order/tag/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.data.result) {
        Noti.hintOk('删除成功', '已成功删除该标签')
        this.updateTags()
        this.updateList()
      } else {
        Noti.hintWarning('删除出错', '请稍后再尝试')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  postTag = e => {
    let { tagId, note, posting } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let description = note.trim()
    let resource = '/work/order/tag/add'
    const body = {
      description: description
    }
    if (tagId) {
      resource = '/work/order/tag/update'
      body.id = tagId
    }
    const cb = json => {
      let nextState = {
        posting: false
      }
      if (json.data.result) {
        // success
        nextState.showBuildTag = false
        nextState.note = ''
        nextState.originalTag = ''
        nextState.tagId = ''
        Noti.hintOk('操作成功', '当前标签添加成功')
        // refetch list
        this.updateTags()
        this.updateList()
      } else {
        Noti.hintWarning('', json.data.failReason || '操作失败，请稍后重试')
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  updateList = () => {
    let {
      schoolId,
      panel_page,
      panel_rangeIndex,
      panel_startTime,
      panel_endTime,
      mainCate,
      order,
      orderBy,
      assess_dim
    } = this.props[subModule]
    let page = panel_page[mainCate]
    let day = panel_rangeIndex[mainCate]
    let startTime = panel_startTime[mainCate],
      endTime = panel_endTime[mainCate]
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (day !== 0) {
      body.day = day
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    }

    if (mainCate === REPORT_CATE_ASSESS - 1 && orderBy[assess_dim - 1] !== 0) {
      body.order = order[assess_dim - 1]
      body.orderBy = orderBy[assess_dim - 1]
    }

    let resource = '/work/order/tag/stat/list'
    this.fetchReports(resource, body, REPORT_CATE_COMPLAINT)
  }
  updateTags = () => {
    let resource = '/work/order/tag/list'
    const body = {
      page: 1,
      size: 1000
    }
    const cb = json => {
      if (json.data.tags) {
        let tags = {}
        json.data.tags.forEach(r => {
          tags[r.id] = r.description
        })
        this.props.setTagList(tags)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeOnline = e => {
    this.props.changeOnline()
    /*
    let resource = '/employee/cs/online';
    const body = null;
    const cb = json => {
      if (json.data.result) {
        Noti.hintOk('操作成功', '已成功上线');
        this.props.setUserInfo({
          csOnline: true
        });
      } else {
        Noti.hintWarning('上线出错', '未成功上线，请稍后重试');
      }
    };
    AjaxHandler.ajax(resource, body, cb);
    */
  }
  render() {
    const { isCs, csOnline } = this.props.user
    let {
      mainCate,
      schoolId,
      panel_rangeIndex,
      panel_page,
      assess_dim
    } = this.props[subModule]
    const { forbiddenStatus } = this.props
    // console.log(dataSource)
    const {
      loading,
      startTime,
      endTime,
      dataSource,
      total,
      showBuildTag,
      note,
      noteError,
      tagExistError,
      tagLengthError
    } = this.state

    let page = panel_page[mainCate]
    let max = 1
    // unused is used to keep 'max' is the real max
    let unused =
      mainCate === REPORT_CATE_COMPLAINT - 1 &&
      dataSource &&
      dataSource.length > 0 &&
      dataSource.forEach(r => {
        if (r.amount > max) {
          max = r.amount
        }
      })

    const sumTable = mainCate === REPORT_CATE_SUM - 1 && (
      <Table
        bordered
        loading={loading}
        rowKey={record => `sum${record.userId}`}
        pagination={{
          pageSize: SIZE,
          current: page,
          total: total
        }}
        // dataSource={panel_dataSource[mainCate]}
        dataSource={dataSource}
        columns={this.sumColumns}
        onChange={this.changeTable}
        onRowClick={this.selectRow}
        rowClassName={this.setRowClass}
      />
    )

    const complaintColumns = [
      {
        title: '问题',
        width: '25%',
        dataIndex: 'description'
      },
      {
        title: '次数',
        width: '50%',
        dataIndex: 'amount',
        render: (text, record, index) => {
          let indexOfAll = (page - 1) * SIZE + index + 1
          return (
            <Fragment key={`fragment${index}`}>
              <span key={`wrapper${record.id}`} className="sliderWrapper">
                <ProgressBar
                  key={`slider${record.id}`}
                  innerWidth={
                    record.amount ? div(mul(record.amount, 100), max) : 0
                  }
                  bgColor={indexOfAll > 3 ? '#108EE9' : '#ff5555'}
                />
              </span>
              <span className="amountHint mgl10" key={`amount${record.id}`}>{`${
                record.amount
              }次`}</span>
            </Fragment>
          )
        }
      },
      {
        title: <span className="ope">操作</span>,
        dataIndex: 'operation',
        className: 'ope',
        render: (text, record, index) => (
          <div className="editable-row-operations">
            <a href="" onClick={e => this.editTag(e, record.id)}>
              编辑
            </a>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此标签么?"
              onConfirm={e => {
                this.deleteTag(e, record.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        )
      }
    ]
    const complaintTable = mainCate === REPORT_CATE_COMPLAINT - 1 && (
      <Table
        bordered
        loading={loading}
        rowKey={record => `complaint${record.id}`}
        pagination={{
          pageSize: SIZE,
          current: page,
          total: total
        }}
        dataSource={dataSource}
        columns={complaintColumns}
        onChange={this.changeTable}
        onRowClick={this.selectRow}
        rowClassName={this.setRowClass}
      />
    )

    const assessSchoolTable = mainCate === REPORT_CATE_ASSESS - 1 &&
      assess_dim === ASSESS_SCHOOL && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          // dataSource={panel_dataSource[mainCate]}
          dataSource={dataSource}
          columns={this.assessSchoolColumns}
          onChange={this.changeTable}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      )

    const assessCustomTable = mainCate === REPORT_CATE_ASSESS - 1 &&
      assess_dim === ASSESS_CUSTOM && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          // dataSource={panel_dataSource[mainCate]}
          dataSource={dataSource}
          columns={this.assessCustomColumns}
          onChange={this.changeTable}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      )

    const assessRepairmanTable = mainCate === REPORT_CATE_ASSESS - 1 &&
      assess_dim === ASSESS_REPAIRMAN && (
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={{
            pageSize: SIZE,
            current: page,
            total: total
          }}
          dataSource={dataSource}
          columns={this.assessRepairmanColumns}
          onChange={this.changeTable}
          onRowClick={this.selectRow}
          rowClassName={this.setRowClass}
        />
      )

    return (
      <div className="taskPanelWrapper" ref="wrapper">
        {loading ? <div className="loadingMask" /> : null}

        {isCs && !csOnline ? (
          <div className="loadingMask offlineWrapper">
            <div className="offline">
              <img src={notworking} alt="offline" />
              <span>未进入工作状态</span>
              <Button size="small" type="primary" onClick={this.changeOnline}>
                点击上班
              </Button>
            </div>
          </div>
        ) : null}
        <div className="phaseLine">
          <div className="block">
            <div className="navLink" onClick={this.changeCate}>
              <a
                href=""
                className={mainCate === 0 ? 'active' : ''}
                data-key={0}
              >
                工作情况
              </a>
              <a
                href=""
                id="test"
                className={mainCate === 1 ? 'active' : ''}
                data-key={1}
              >
                投诉分析
              </a>
              <a
                href=""
                className={mainCate === 2 ? 'active' : ''}
                data-key={2}
              >
                绩效考核
              </a>
            </div>
            <div className="task-select">
              <SchoolSelector
                className="select-item customSelect"
                selectedSchool={schoolId}
                changeSchool={this.changeSchool}
              />
            </div>
          </div>
          {mainCate === REPORT_CATE_COMPLAINT - 1 ? (
            <div className="block">
              {forbiddenStatus.BUILD_COMPLAINT_TAG ? null : (
                <Button
                  type="primary"
                  className="rightBtn"
                  onClick={this.addTag}
                >
                  添加投诉标签
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>{TIMELABEL[mainCate]}:</span>
              <CheckSelect
                options={TIMERANGESELECTS}
                value={panel_rangeIndex[mainCate]}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="rangeSelect"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          {mainCate === REPORT_CATE_ASSESS - 1 ? (
            <div className="queryLine">
              <div className="block">
                <span>考核维度:</span>
                <CheckSelect
                  options={REPORT_ASSESS_TYPE}
                  value={assess_dim}
                  onClick={this.changeAssessDim}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="tableList">
          {mainCate === REPORT_CATE_SUM - 1 ? sumTable : null}
          {mainCate === REPORT_CATE_COMPLAINT - 1 ? complaintTable : null}
          {mainCate === REPORT_CATE_ASSESS - 1
            ? assess_dim === ASSESS_SCHOOL
              ? assessSchoolTable
              : assess_dim === ASSESS_CUSTOM
                ? assessCustomTable
                : assessRepairmanTable
            : null}
        </div>

        <Modal
          wrapClassName="modal finish"
          width={450}
          title="添加标签"
          visible={showBuildTag}
          onCancel={this.cancelBuildTag}
          footer={null}
          okText=""
        >
          <div className="info buildTask">
            <ul>
              <li>
                <p style={{ width: '65px' }}>标签:</p>
                <input
                  value={note}
                  className="longInput"
                  onChange={this.changeNote}
                  onBlur={this.checkNote}
                  placeholder="不超过10字"
                />
                {noteError ? (
                  <span className="checkInvalid">内容不能为空</span>
                ) : null}
                {tagExistError ? (
                  <span className="checkInvalid">此标签已存在！</span>
                ) : null}
                {tagLengthError ? (
                  <span className="checkInvalid">请勿超过10字！</span>
                ) : null}
              </li>
            </ul>
            <div className="btnArea">
              <Button onClick={this.confirmBuildTag} type="primary">
                确认
              </Button>
              <Button onClick={this.cancelBuildTag}>返回</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  report: state.taskModule[subModule],
  user: state.setUserInfo,
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  tagInfo: state.setTagList
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo,
    setTagList,
    changeOnline
  })(TaskReport)
)
