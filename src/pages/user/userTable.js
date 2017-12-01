import React from 'react'
import Table from 'antd/lib/table'
import { Link} from 'react-router-dom'
import AjaxHandler from '../ajax'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import Time from '../component/time'
import CONSTANTS from '../component/constants'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser } from '../../actions'
const subModule = 'userList'

const SIZE = CONSTANTS.PAGINATION

const typeName = {
  1: '热水器',
  2: '饮水机',
  3: '洗衣机',
  4: '电吹风'
}
const STATUS = {
  1: '正常',
  2: '报修'
}

class UserTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    let dataSource=[]
    let searchingText = ''
    this.state = {
      dataSource, searchingText,
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校名称',
      dataIndex: 'schoolName',
      className: 'firstCol'
    }, {
      title: '用户手机号',
      dataIndex: 'mobile'
    },{
      title: '注册时间',
      dataIndex: 'createTime',
      render:(text,record)=>(Time.getTimeStr(record.createTime))
    },{
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '12%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <Link to={`/user/userInfo/:${record.id}`} >详情</Link>
          </span>
        </div>
      )
    }]
  } 

  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/user/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.users
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
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
    let {page, schoolId, selectKey} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
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
    let {page, schoolId, selectKey} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (selectKey) {
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
    this.props.changeUser(subModule, {page: 1, schoolId: value})
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
    let selectKey = this.props.selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeUser(subModule, {page: 1, selectKey: v})
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeUser(subModule, {page: page})
  }

  render () {
    const {dataSource, total, loading} = this.state
    const {page, schoolId} = this.props

    return (
      <div className='contentArea'>
        <SearchLine searchInputText='手机号' selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />} searchingText={this.state.searchingText} pressEnter={this.pressEnter} changeSearch={this.changeSearch} />

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
      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeUser[subModule].schoolId,
  selectKey: state.changeUser[subModule].selectKey,
  page: state.changeUser[subModule].page
})

export default withRouter(connect(mapStateToProps, {
 changeUser 
})(UserTable))
