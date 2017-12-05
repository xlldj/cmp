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
    endTime: PropTypes.number.isRequired
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
      title: '用户',
      dataIndex: 'mobile',
      width: '10%'
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
      render: (text,record)=>(typeName[record.operationType])
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
        }else{
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
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
    const body={
      size: SIZE
    }
    if(this.props.location.state){
      this.props.changeFund(subModule, {page: 1, selectKey: this.props.location.state.mobile.toString(), type: 'all', status: 'all', schoolId: 'all'})
      body.page = 1
      body.selectKey = this.props.location.state.mobile.toString()
      this.setState({
        searchingText:this.props.location.state.mobile.toString()
      })
      return this.fetchData(body)
    }

    let {page, schoolId, type, status, selectKey, startTime, endTime} = this.props
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
      body.timeQueryType = 1 // 选择时间类型为create_time
    }
    body.page = page
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
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page, schoolId, type, status, selectKey, startTime, endTime} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
      body.timeQueryType = 1
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
  changeStartTime = (v) => {
    let newStartTime = v ? parseInt(v.valueOf(), 10) : 0
    this.setState({
      subStartTime: newStartTime
    })
    if (newStartTime === 0) {
      return this.confirmStartTime({
        subStartTime: 0
      })
    }
  }
  changeEndTime = (v) => {
    let newEndTime = v ? parseInt(v.valueOf(), 10) : 0
    this.setState({
      subEndTime: newEndTime
    })
    if (newEndTime === 0) {
      return this.confirmEndTime({
        subEndTime: 0
      })
    }
  }
  confirmStartTime = (state) => {
    let {subStartTime} = {...this.state, ...state}
    let {startTime} = this.props
    if (startTime !== subStartTime) {
      this.props.changeFund(subModule, {startTime: subStartTime, page: 1})
    }
  }
  confirmEndTime = (state) => {
    let {subEndTime} = {...this.state, ...state}
    let {endTime} = this.props
    if (endTime !== subEndTime) {
      this.props.changeFund(subModule, {endTime: subEndTime, page: 1})
    }
  }

  render () {
    const {searchingText,dataSource, total, loading, subStartTime, subEndTime} = this.state
    let {page, schoolId, type, status, startTime, endTime} = this.props

    return (
      <div className='contentArea'>
        <SearchLine 
          showTimeChoose={true}
          timeChooseTitle='开始时间'
          startTime={subStartTime}
          endTime={subEndTime}
          changeStartTime={this.changeStartTime}
          changeEndTime={this.changeEndTime}
          confirmStartTime={this.confirmStartTime}
          confirmEndTime={this.confirmEndTime}

          searchInputText='用户／订单号' 
          searchingText={searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch} 
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} 
          selector2={<OperationSelector selectedOpration={type} changeOpration={this.changeOpration} />} 
          selector3={<BasicSelector allTitle='全部状态' staticOpts={STATUS} selectedOpt={status} changeOpt={this.changeStatus} />} 
        />
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
  page: state.changeFund[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeFund
})(FundTable))
