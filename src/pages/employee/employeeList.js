import React from 'react'
import { Link} from 'react-router-dom'
import { Table, Button } from 'antd'
import Popconfirm from 'antd/lib/popconfirm'
import Noti from '../noti'
import AjaxHandler from '../ajax'
import SearchLine from '../component/searchLine'
import CONSTANTS from '../component/constants'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../actions'
const subModule = 'employeeList'


const SIZE = CONSTANTS.PAGINATION
const TYPE = CONSTANTS.ROLE
const BACKTITLE={
  fromInfoSet: '返回学校信息设置'
}

class EmployeeList extends React.Component {
  static propTypes = {
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    this.state = {
      dataSource: [],
      searchingText: '',
      loading: false,
      total: ''
    }
    this.columns = [{
      title: '手机号',
      dataIndex: 'mobile',
      width: '25%',
      className: 'firstCol'
    }, {
      title: '姓名',
      dataIndex: 'nickName',
      width: '25%'
    }, {
      title: '身份',
      dataIndex: 'type',
      width: '25%',
      render: (text,record,index) => (
        TYPE[record.type]
      )
    }, {
      title: '操作',
      dataIndex: 'operation',
      className: 'lastCol',
      render: (text, record, index) => (
        <div style={{textAlign:'right'}} key={index} className='editable-row-operations'>
            <Link to={`/employee/userInfo/:${record.id}`} >编辑</Link>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/employee/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          nextState.dataSource =  json.data.users
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
    let {page, selectKey} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
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
    let {page, selectKey} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  delete = (e,id) => {
    e.preventDefault()
    let resource='/api/user/delete'
    const body={
      id: id
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            const body={
              page: this.props.page,
              selectKey: '',
              size: 100
            }
            this.fetchData(body)
          }else{
            Noti.hintError()
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)    
  }
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeEmployee(subModule, {page: 1, selectKey: v})
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  back = (e) => {
    this.props.history.goBack()
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeEmployee(subModule, {page: page})
  }

  render () {
    const {dataSource,searchingText, total, loading} = this.state
    const {page} = this.props

    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加新员工' addLink='/employee/addUser' searchInputText='身份／姓名／手机号' searchingText={searchingText} pressEnter={this.pressEnter} changeSearch={this.changeSearch} />

        <div className='tableList'>
          <Table 
            bordered
            loading={loading}
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: page, total: total}}  
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage}
          />
        </div>
        {this.props.location.state ?
          <div className='btnRight'>
            <Button onClick={this.back}>{BACKTITLE[this.props.location.state.path]}</Button>
          </div>
          :null
        }
      </div>
    )
  }
}



const mapStateToProps = (state, ownProps) => ({
  selectKey: state.changeEmployee[subModule].selectKey,
  page: state.changeEmployee[subModule].page
})

export default withRouter(connect(mapStateToProps, {
 changeEmployee 
})(EmployeeList))
