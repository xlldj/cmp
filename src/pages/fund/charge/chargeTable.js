import React from 'react'
import {Link} from 'react-router-dom'

import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Popconfirm from 'antd/lib/popconfirm'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import SearchLine from '../../component/searchLine'


import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../../actions'
const subModule = 'charge'

const SIZE = CONSTANTS.PAGINATION

class ChargeTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      dataIndex: 'schoolName',
      width: '20%',
      className: 'firstCol'
    }, {
      title: '充值面额(元)',
      dataIndex: 'items',
      width: '50%',
      className: 'amountItem',
      render: (text, record, index) => {
        let lis = record.items.map((r, i) => (
          <span key={`chargeItem${i}`}>{r}</span>
        ))
        return (
          <p>
            {lis}
          </p>
        )
      }
    }, {
      title: '操作',
      dataIndex: 'operation',
      className: 'lastCol',
      render: (text, record, index) => (
        <div key={`operation${index}`} className='editable-row-operations'>
          <Link to={{pathname: `/fund/charge/editCharge/:${record.schoolId}`}}>编辑</Link>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/recharge/denomination/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const data = json.data.rechargeDenominations.map((s,i) => {
            s.key = s.id
            return s
          })
          nextState.dataSource = data
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
      page: this.props.page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    let {page} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeFund(subModule, {page: page})
  }
  render () {
    let {total, loading, dataSource} = this.state 
    let {page} = this.props
    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加充值面额' addLink='/fund/charge/addCharge' />

        <div className='tableList'>
          <Table bordered 
            loading={loading} rowKey={(record)=>(record.id)} 
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
  page: state.changeFund[subModule].page
})

export default withRouter(connect(mapStateToProps, {
  changeFund
})(ChargeTable))