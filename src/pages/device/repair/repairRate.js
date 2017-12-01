import React from 'react'

import {Table} from 'antd'

import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import Time from '../../component/time'
const SIZE = CONSTANTS.PAGINATION

class RepairRate extends React.Component {
  constructor(props){
    super(props)
    let dataSource=[]
    let data = [{
      "id": 0,
      "rating": 0,
      "ratingContent": "",
      "ratingOption": "",
      "repairId": 0,
      "repairmanId": 0,
      "repairmanName": "",
      "schoolId": 0,
      "schoolName": "",
      "userId": 0,
      "userName": ""
    }]
    this.state = {
      dataSource: data,
      loading: false,
      page: 1,
      total: 0
    }
    this.columns = [{
      title: '学校',
      width: '15%',
      dataIndex: 'schoolName',
      className: 'firstCol'
    }, {
      title: '用户',
      dataIndex: 'userName',
      width: '10%'
    }, {
      title: '评分',
      dataIndex: 'rating',
      width: '8%'
    }, {
      title: '评价选项',
      dataIndex: 'ratingOption',
      width: '15%',
      render: (text) => (text || '暂无')
    }, {
      title: '评价内容',
      dataIndex: 'ratingContent'
    }, {
      title: '维修员',
      dataIndex: 'repairmanName',
      width: '13%'
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/repair/rating/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          nextState.dataSource = json.data.repairRatings
          nextState.total = json.data.total
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }  

  componentDidMount(){
    this.props.hide(false) 
    const body={
      page: 1,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.setState({
      page: page,
      loading: true
    })
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }

  render () {
    let {page, total, loading, dataSource} = this.state 

    return (
      <div className='contentArea'>
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

export default RepairRate
