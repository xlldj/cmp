import React from 'react'

import { Table, Badge, Button } from 'antd'
import AjaxHandler from '../../../../util/ajax'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
import selectedImg from '../../../assets/selected.png'

import RangeSelect from '../../../component/rangeSelect'
import SearchInput from '../../../component/searchInput'
import CheckSelect from '../../../component/checkSelect'
import BuildingMultiSelectModal from '../../../component/buildingMultiSelectModal'
import OrderDetail from './orderInfo'

import { checkObject } from '../../../../util/checkSame'
const subModule = 'orderList'

const {
  PAGINATION: SIZE,
  DEVICETYPE,
  ORDER_DAY_SELECT,
  ORDERUSERTYPES,
  ORDERSTATUS
} = CONSTANTS

const BACKTITLE = {
  fromUser: '返回用户详情',
  fromUserAnalyze: '返回用户消费分析',
  fromDevice: '返回设备详情',
  fromTask: '返回工单'
}
/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class OrderTableView extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      totalIncome: 0,
      totalChargeback: 0,
      searchingText: '',
      subStartTime: this.props.startTime,
      subEndTime: this.props.endTime,
      showBuildingSelect: false
    }
  }
  fetchList = props => {
    this.setState({
      loading: true
    })
    props = props || this.props
    const body = this.getPostBody(props)

    let resource = '/api/order/list'
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = { loading: false }
      if (json && json.data) {
        json.data.orders &&
          json.data.orders.forEach((r, i) => {
            r.paymentType = r.paymentType && r.paymentType.toString()
          })
        nextState.dataSource = json.data.orders
        nextState.total = json.data.total
      }
      this.setState(nextState)
    })
  }
  getPostBody = props => {
    let { state } = props.history.location

    let {
      page,
      schoolId,
      deviceType,
      status,
      selectKey,
      startTime,
      endTime,
      userType,
      day,
      buildingIds
    } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    } else {
      body.day = parseInt(day, 10)
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (buildingIds !== 'all') {
      body.buildingIds = buildingIds
    }
    if (status !== 'all') {
      body.status = parseInt(status, 10)
    } else {
      body.statusList = [1, 2, 4]
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (userType && userType !== 'all') {
      body.userType = parseInt(userType, 10)
    }
    if (state) {
      if (state.path === 'fromDevice') {
        body.residenceId = state.id
        body.deviceType = state.deviceType
      } else if (
        state.path === 'fromUser' ||
        state.path === 'fromUserAnalyze'
      ) {
        body.userId = state.id
      } else if (state.path === 'fromTask') {
        if (state.userId) {
          body.userId = state.userId
        } else if (state.deviceType) {
          body.residenceId = state.residenceId
          body.deviceType = state.deviceType
        }
      }
      delete body.schoolId
    }
    return body
  }
  fetchSum = props => {
    props = props || this.props
    const body = this.getPostBody(props)
    const resource = '/api/order/finish/sum'
    this.setState({
      sumLoading: true
    })
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { sumLoading: false }
      if (json && json.data) {
        nextState.totalIncome = json.data || 0
      }
      this.setState(nextState)
    })
  }
  fetchChargeBackSum = props => {
    props = props || this.props
    const body = this.getPostBody(props)
    const resource = '/api/order/chargeback/sum'
    this.setState({
      chargebackSumLoading: true
    })
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { chargebackSumLoading: false }
      if (json && json.data) {
        nextState.totalChargeback = json.data || 0
      }
      this.setState(nextState)
    })
  }
  fetchAllData = props => {
    // fetch list
    this.fetchList(props)
    // fetch sum
    this.fetchSum(props)
    // fetch chargeback sum
    this.fetchChargeBackSum(props)
  }
  componentDidMount() {
    this.fetchAllData()
    // add click event
    let root = document.getElementById('root')
    this.root = root
    root.addEventListener('click', this.closeDetail, false)
    this.syncStateWithProps()
  }
  componentWillUnmount() {
    this.root.removeEventListener('click', this.closeDetail)
  }
  componentWillReceiveProps(nextProps) {
    // handle close detail click event
    if (!nextProps.showDetail && this.props.showDetail) {
      // closed detail
      this.root.removeEventListener('click', this.closeDetail)
    } else if (!this.props.showDetail && nextProps.showDetail) {
      this.root.addEventListener('click', this.closeDetail, false)
    }
    if (
      checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'status',
        'selectKey',
        'page',
        'startTime',
        'endTime',
        'userType',
        'buildingIds'
      ])
    ) {
      return
    }
    this.syncStateWithProps(nextProps)
    if (this.onlyPageChanged(this.props, nextProps)) {
      this.fetchList(nextProps)
    } else {
      this.fetchAllData(nextProps)
    }
  }
  onlyPageChanged = (prev, cur) => {
    if (
      checkObject(prev, cur, [
        'day',
        'schoolId',
        'deviceType',
        'status',
        'selectKey',
        'startTime',
        'endTime',
        'userType',
        'buildingIds'
      ])
    ) {
      return true
    }
    return false
  }
  syncStateWithProps = props => {
    let { startTime, endTime, selectKey } = props || this.props
    const nextState = {}
    if (startTime !== this.state.startTime) {
      nextState.startTime = startTime
      nextState.endTime = endTime
    }
    if (selectKey !== this.state.searchingText) {
      nextState.searchingText = selectKey
    }
    this.setState(nextState)
  }
  closeDetail = e => {
    if (!this.props.showDetail) {
      return
    }
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      console.log('contain')
      return
    }
    if (this.props.showDetail) {
      this.props.changeOrder(subModule, {
        showDetail: false,
        selectedRowIndex: -1,
        selectedDetailId: -1
      })
    }
  }

  changeDevice = value => {
    let { deviceType } = this.props
    if (value === deviceType) {
      return
    }
    this.props.changeOrder(subModule, { deviceType: value, page: 1 })
  }
  changeStatus = value => {
    let { status } = this.props
    if (value === status) {
      return
    }
    this.props.changeOrder(subModule, { status: value, page: 1 })
  }
  changeSearch = e => {
    const nextState = {}
    nextState.searchingText = e.target.value
    this.setState(nextState)
  }
  pressEnter = () => {
    let { selectKey } = this.props
    let searchingText = this.state.searchingText.trim()
    if (selectKey !== searchingText) {
      this.props.changeOrder(subModule, { selectKey: searchingText, page: 1 })
    }
  }
  clearMobile = () => {
    this.setState(
      {
        searchingText: ''
      },
      this.pressEnter
    )
  }
  back = () => {
    this.props.history.goBack()
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeOrder(subModule, { page: page })
  }
  changeUserType = v => {
    let { userType } = this.props
    if (userType === v) {
      return
    }
    this.props.changeOrder(subModule, { userType: v, page: 1 })
  }
  changeRange = key => {
    this.props.changeOrder(subModule, {
      startTime: '',
      endTime: '',
      day: +key
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
    this.props.changeOrder(subModule, {
      startTime: startTime,
      endTime: endTime,
      page: 1,
      day: 0
    })
  }
  selectRow = (record, index, event) => {
    let { dataSource } = this.state
    // let page = panel_page[main_phase]
    let id = dataSource[index] && dataSource[index].id
    this.props.changeOrder(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      selectedDetailId: id
    })
  }

  setRowClass = (record, index) => {
    let { selectedRowIndex } = this.props
    if (index === selectedRowIndex) {
      return 'selectedRow'
    } else {
      return ''
    }
  }

  showBuildingSelect = () => {
    this.setState({
      showBuildingSelect: true
    })
  }
  confirmBuildings = ({ all, dataSource }) => {
    this.setState({
      showBuildingSelect: false
    })
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    this.props.changeOrder(subModule, {
      buildingIds: buildingIds
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }

  render() {
    const {
      page,
      deviceType,
      status,
      userType,
      day,
      selectedRowIndex,
      showDetail,
      selectedDetailId,
      buildingIds,
      schoolId,
      buildingsOfSchoolId
    } = this.props
    const {
      showBuildingSelect,
      dataSource,
      total,
      totalIncome,
      totalChargeback,
      loading,
      startTime,
      endTime,
      searchingText
    } = this.state
    const showClearBtn = !!searchingText
    const { state } = this.props.location

    const buildingNames =
      buildingIds === 'all'
        ? '全部楼栋'
        : buildingIds
            .map(
              b =>
                buildingsOfSchoolId[+schoolId] &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b) &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b).name
            )
            .join('、')
    const columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        width: '20%',
        className: 'firstCol selectedHintWraper',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '用户',
        dataIndex: 'username',
        width: '10%'
      },
      {
        title: '使用设备',
        dataIndex: 'deviceType',
        width: '7%',
        render: (text, record, index) => DEVICETYPE[record.deviceType]
      },
      {
        title: '所在学校',
        dataIndex: 'schoolName'
      },
      {
        title: '设备地址',
        dataIndex: 'location',
        width: '10%'
      },
      {
        title: '开始时间',
        dataIndex: 'createTime',
        width: '10%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.createTime)
        }
      },
      {
        title: '结束时间',
        dataIndex: 'finishTime',
        width: '10%',
        render: (text, record, index) => {
          return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        width: '10%',
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
    return (
      <div className="">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={ORDER_DAY_SELECT}
                value={+day}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="seperator"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>楼栋筛选:</span>
              <span className="customized_select_option">{buildingNames}</span>
              <Button type="primary" onClick={this.showBuildingSelect}>
                点击选择
              </Button>
            </div>
          </div>
          <div className="queryLine">
            <div className="block">
              <span>用户类型:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDERUSERTYPES}
                value={userType}
                onClick={this.changeUserType}
              />
            </div>
          </div>
          <div className="queryLine">
            <div className="block">
              <span>设备类型:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={DEVICETYPE}
                value={deviceType}
                onClick={this.changeDevice}
              />
            </div>
            <div className="block">
              {showClearBtn ? (
                <Button
                  onClick={this.clearMobile}
                  className="rightSeperator"
                  type="primary"
                >
                  清空
                </Button>
              ) : null}
              <SearchInput
                placeholder="宿舍/订单号/手机号"
                searchingText={searchingText}
                pressEnter={this.pressEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>
          <div className="queryLine">
            <div className="block">
              <span>使用状态:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDERSTATUS}
                value={status}
                onClick={this.changeStatus}
              />
            </div>
            <div className="block">
              <span className="seperator">
                总收益(使用结束): {totalIncome}元
              </span>
              <span>已退单: {totalChargeback}元</span>
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            bordered
            showQuickJumper
            loading={loading}
            pagination={{
              pageSize: SIZE,
              current: page,
              total: total,
              showQuickJumper: true
            }}
            dataSource={dataSource}
            rowKey={record => record.id}
            columns={columns}
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>

        {showDetail ? (
          <div ref="detailWrapper">
            <OrderDetail
              orderId={selectedDetailId}
              changeOrder={this.props.changeOrder}
              ref="detailWrapper"
            />
          </div>
        ) : null}
        {state ? (
          <div className="btnRight marginBottom">
            <Button onClick={this.back}>{BACKTITLE[state.path]}</Button>
          </div>
        ) : null}
        {showBuildingSelect ? (
          <BuildingMultiSelectModal
            all={buildingIds === 'all'}
            selectedItems={buildingIds !== 'all' ? buildingIds : []}
            schoolId={schoolId}
            closeModal={this.closeBuildingSelect}
            confirmBuildings={this.confirmBuildings}
          />
        ) : null}
      </div>
    )
  }
}

export default OrderTableView
