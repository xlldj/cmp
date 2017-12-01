import React from 'react'
import {asyncComponent} from '../component/asyncComponent'

import {Table, Button, Popconfirm, Modal} from 'antd'

import Noti from '../noti'
import AjaxHandler from '../ajax'
import SearchLine from '../component/searchLine'
import CONSTANTS from '../component/constants'
const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class SupplierList extends React.Component {
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      visible: false,
      addingName: '',
      editing: false,
      editingIndex: '',
      loading: false,
      page: 1,
      total: 0
    }
    this.columns = [{
      title: (<p className='firstCol'>供应商名字</p>),
      dataIndex: 'name',
      width: '80%',
      render: (text) => (<p className='firstCol'>{text}</p>)
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '20%',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <a href='' onClick={(e) => {this.edit(e,index)}}>编辑</a>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此么?" onConfirm={(e) => {this.delete(e,index)}} okText="确认" cancelText="取消">
              <a href="#">删除</a>
            </Popconfirm>
          </span>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/api/supplier/query/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const data = json.data.supplierEntities.map((s,i) => {
            s.key = s.id
            return s
          })
          nextState.dataSource = data
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
  /*-------打开弹窗开始添加---------*/
  addSupplier = () => {
    //弹窗显示添加一个名字就ok
    this.setState({
      visible: true
    })
  }
  postSupplier = () => {
    //save it to the list and post the info to the server
    const body = {
      name: this.state.addingName
    }
    let resource='/api/supplier/save'
    if(this.state.editing){
      this.setState({
        visible: false,
        addingName: '',
        editing: false
      })
      /*-----------update the data into the database-----------*/
      body.id = this.state.dataSource[this.state.editingIndex].id
      /*-----------dosen't need to fetch data again------------*/
      
    }else{
      this.setState({
        visible: false,
        addingName: '',
        editing: false
      })
      /*-----------push the newly added data to the database--------------*/
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          //重新拉取数据
          if(json.data.id === -1){
            Noti.hintLock('该供应商已经添加','请重新输入供应商名！')
          }else{
            Noti.hintSuccessWithoutSkip()
            
            const body={
              page: 1,
              size: SIZE
            }
            this.fetchData(body)
            this.setState({
              page: 1
            })
          }
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  cancelPost = () => {
    //reset the addingName 
    this.setState({
      visible: false,
      addingName: '',
      editing: false
    })    
  }
  changeAddingName = (e) => {
    this.setState({
      addingName: e.target.value.trim()
    })
  }
  edit = (e,index) => {
    //open the modal with the data
    e.preventDefault()
    this.setState({
      visible: true,
      addingName: this.state.dataSource[index].name,
      editing: true,
      editingIndex: index
    })
  }
  delete = (e,index) => {
    e.preventDefault()
    let resource='/api/supplier/delete'
    const body = {
      id: this.state.dataSource[index].id
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            const body = {
              page: this.state.page,
              size: SIZE
            }
            this.fetchData(body)
          }else{
            Noti.hintError('当前供应商不能被删除','请先清除该供应商设备再删除！')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
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
    let {loading, page, total} = this.state
    return (
      <div className='contentArea'>
        <SearchLine openTitle='添加供应商' openModal={this.addSupplier} />

          <div className='tableList'>
            <Table bordered  loading={loading} rowKey={(record)=>(record.id)}  pagination={{pageSize: SIZE, current: page, total: total}} onChange={this.changePage}  dataSource={this.state.dataSource} columns={this.columns} />
          </div>
          <div>
          <Modal
            title="添加供应商"
            visible={this.state.visible}
            onOk={this.postSupplier}
            onCancel={this.cancelPost}
            maskClosable={false}
            className='addSupplierModal'
          >
            <label htmlFor='name' >请输入供应商名字：<input name='name' id='name' style={{width:'60%',height:'30px',marginLeft:'20px'}} value={this.state.addingName} onChange={this.changeAddingName} /></label>
          </Modal>
          </div>
      </div>
    )
  }
}

export default SupplierList
