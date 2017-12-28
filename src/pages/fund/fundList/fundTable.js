import React from 'react'
import { Link} from 'react-router-dom'

import { Table, Badge ,Button} from 'antd'

import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
import OperationSelector from '../../component/operationSelector'
import BasicSelector from '../../component/basicSelector'
import SearchLine from '../../component/searchLine'
import SchoolSelector from '../../component/schoolSelector'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
import { checkObject } from '../../util/checkSame'
const subModule = 'fundList'

const typeName = CONSTANTS.FUNDTYPE
const STATUS = CONSTANTS.WITHDRAWSTATUS
const SIZE = CONSTANTS.PAGINATION

/* status枚举：
{1: '等待审核', 2: '审核失败（拒绝）', 3: '等待第三方确认支付情况', 4: '提现充值成功', 5: '提现充值失败'}
*/

/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */

class FundTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
    userType: PropTypes.string.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[], searchingText=''
    this.state = {
      dataSource, searchingText,
      loading: false,
      total: 0,
      subStartTime: this.props.startTime,
      subEndTime: this.props.endTime
    }
    this.columns = [{
      title: '流水号',
      dataIndex: 'orderNo',
      width: '20%',
      className: 'firstCol',
      render: (text) => (text || '暂无')
    }, {
      title: '手机号',
      dataIndex: 'executorMobile',
      width: '10%',
      render: (text) => (text || '')
    }, {
      title: '学校',
      dataIndex: 'schoolName',
      width: '15%'
    }, {
      title: '时间',
      dataIndex: 'createTime',
      width: '15%',
      render: (text,record,index) => {
        return Time.getTimeStr(record.createTime)
      }
    }, {
      title: '操作类型',
      dataIndex: 'operationType',
      width: '10%',
      render: (text,record) => {
        if (record.instead) {
          return (typeName[record.operationType]) + '(代充值)'
        } else {
          return (typeName[record.operationType])
        }
      }
    }, {
      title: '操作状态',
      dataIndex: 'status',
      width: '10%',
      render: (text,record,index) => {
        switch(record.status){
          case 1:
            return <Badge status='error' text={STATUS[record.status]} />
          case 2:
          case 5:
          case 6:
            return <Badge status='default' text={STATUS[record.status]} />
          case 3: 
            return <Badge status='warning' text={STATUS[record.status]} />
          case 4: 
            return <Badge status='success' text={STATUS[record.status]} />
          default:
            return <Badge status='warning' text='未知' />
        }
      }
    }, {
      title: '金额',
      dataIndex: 'amount',
      width: '10%',
      className:'shalowRed',
      render: (text)=>(`¥${text}`)
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '10%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/fund/list/fundInfo/:${record.id}`} >详情</Link>
          </span>
        </div>
      )
    }]
  }

  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/funds/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.funds
          nextState.total = json.data.total
          nextState.totalRecharge = json.data.totalRecharge ? json.data.totalRecharge : 0
          nextState.totalWithdraw = json.data.totalWithdraw ? json.data.totalWithdraw : 0
        }else{
          this.setState(nextState)
        }        
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }

  componentDidMount(){
    this.props.hide(false) 
    let {page, schoolId, type, status, selectKey, startTime, endTime, userType} = this.props
    const body = {
      page: page,
      size: SIZE
    }

    if (startTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (type !== 'all') {
      body.type = type
    }
    if (status !== 'all') {
      body.status = [parseInt(status, 10)]
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (userType && userType !== 'all') {
      body.userType = parseInt(userType, 10)
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId', 'type', 'status', 'selectKey', 'startTime', 'endTime', 'userType'])) {
      return
    }
    let {page, schoolId, type, status, selectKey, startTime, endTime, userType} = nextProps
    const body = {
      page: page,
      size: SIZE
    }

    if (startTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if(type !== 'all'){
      body.type = type
    }
    if(status !== 'all'){
      body.status = [parseInt(status, 10)]
    }
    if(selectKey){
      body.selectKey = selectKey
    }
    if (userType && userType !== 'all') {
      body.userType = parseInt(userType, 10)
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeFund(subModule, {page: 1, schoolId: value})
  }
  changeOpration = (value) => {
    let {type} = this.props
    if (type === value) {
      return
    }
    this.props.changeFund(subModule, {page: 1, type: value})
  }
  changeStatus = (value) => {
    let {status} = this.props
    if (status === value) {
      return
    }
    this.props.changeFund(subModule, {page: 1, status: value})   
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }

  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let {selectKey} = this.props
    if (selectKey === v) {
      return
    }
    this.props.changeFund(subModule, {page: 1, selectKey: v})
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeFund(subModule, {page: page})
  }

  back=()=>{
    this.props.history.goBack()
  }

  changeRange = (dates,dateStrings)=>{
    let timeStamps = dates.map((r) => (r.valueOf()))
    this.setState({
      subStartTime: timeStamps[0],
      subEndTime: timeStamps[1]
    })
  }
  confirmRange = (time) => {
    let timeStamps = time.map((r) => (r.valueOf()))
    this.props.changeFund(subModule, {startTime: timeStamps[0], endTime: timeStamps[1], page: 1})

    /* the flag to hint if confirm button is clicked */
    /* if use this.state.confirmed, the 'onOpenChange' handler will not get the right flag */
    this.confirmed = true
  }
  onOpenChange = (open) => {
    if (open) {
      // set default time
    } else {
      if (!this.confirmed) { // close range picker and did not confirm, set the time to props
        this.setState({
          subStartTime: this.props.startTime,
          subEndTime: this.props.endTime
        })
      }
      this.confirmed = false
    }
  } 
  changeUserType = (v) => {
    let {userType} = this.props
    if (userType === v) {
      return
    }
    this.props.changeFund(subModule, {userType: v, page: 1})
  } 
  render () {
    const {searchingText,dataSource, total, loading, subStartTime, subEndTime, totalWithdraw, totalRecharge} = this.state
    let {page, schoolId, type, status, userType} = this.props

    return (
      <div className='contentArea'>
        <SearchLine 
          showTimeChoose={true}
          startTime={subStartTime}
          endTime={subEndTime}
          changeRange={this.changeRange}
          confirm={this.confirmRange}
          onOpenChange={this.onOpenChange}

          searchInputText='用户／订单号' 
          searchingText={searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch} 
          selector1={<BasicSelector allTitle='全部用户' staticOpts={CONSTANTS.ORDERUSERTYPES} selectedOpt={userType} changeOpt={this.changeUserType} />}
          selector2={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} 
          selector3={<OperationSelector selectedOpration={type} changeOpration={this.changeOpration} />} 
          selector4={<BasicSelector allTitle='全部状态' staticOpts={STATUS} selectedOpt={status} changeOpt={this.changeStatus} />} 
        />

        <p className='profitBanner' >
          充值总额: {totalRecharge}元
          <span className='mgl10'>提现总额: {totalWithdraw}</span>元
        </p>

        <div className='tableList'>
          <Table bordered loading={loading} rowKey={(record)=>(record.id)} pagination={{pageSize: SIZE, current: page, total: total}}  dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage} />
        </div>
        {this.props.location.state?
          <div className='btnRight'>
            <Button onClick={this.back}>返回用户详情</Button>
          </div>:null
        }
      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeFund[subModule].schoolId,
  type: state.changeFund[subModule].type,
  status: state.changeFund[subModule].status,
  selectKey: state.changeFund[subModule].selectKey,
  page: state.changeFund[subModule].page,
  startTime: state.changeFund[subModule].startTime,
  endTime: state.changeFund[subModule].endTime,
  userType: state.changeFund[subModule].userType
})

export default withRouter(connect(mapStateToProps, {
  changeFund
})(FundTable))
