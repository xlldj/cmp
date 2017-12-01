import React from 'react'
import {asyncComponent} from '../../component/asyncComponent'

import {Table, Button, Popconfirm, Modal} from 'antd'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'
import DeviceWithoutAll from '../../component/deviceWithoutAll'
const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class ComponentType extends React.Component {
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      visible: false,
      addingName: '',
      deviceType: '0',
      editing: false,
      editingIndex: '',
      typeError: false,
      dtError: false,
      loading: false,
      page: 1,
      total: 0,
      id: 0
    }
    this.columns = [{
      title: '设备类型',
      dataIndex: 'deviceType',
      width: '10%',
      className: 'firstCol',
      render: (text, record) => (CONSTANTS.DEVICETYPE[record.deviceType])
    }, {
      title: '配件类型',
      dataIndex: 'description'
    }, {
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      width: '15%',
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
    let resource='/api/device/component/type/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const data = json.data.componentTypes.map((s,i) => {
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
  addProblem = () => {
    //弹窗显示添加一个名字就ok
    this.setState({
      visible: true
    })
  }
  postCpType = () => {
    let {deviceType, addingName} = this.state
    if (!deviceType || deviceType==='0') {
      return this.setState({
        dtError: true
      })
    }
    if (!this.state.addingName) {
      return this.setState({
        typeError: true
      })
    }
    const body = {
      description: this.state.addingName,
      deviceType: parseInt(this.state.deviceType)
    }
    let resource
    if(this.state.editing){
      resource = '/api/device/component/type/update'
      this.setState({
        visible: false,
        addingName: '',
        editing: false
      })
      /*-----------update the data into the database-----------*/
      body.id = this.state.dataSource[this.state.editingIndex].id
      /*-----------dosen't need to fetch data again------------*/
      
    }else{
      resource = '/api/device/component/type/add'
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
            Noti.hintLock('该配件类型已经添加','请重新输入！')
          }else{
            Noti.hintSuccessWithoutSkip()
            const body={
              size: SIZE
            }
            if (this.state.editing) {
              body.page = this.state.page
            } else {
              body.page = 1
              this.setState({
                page: 1
              })
            }
            this.fetchData(body)
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
      addingName: e.target.value
    })
  }
  edit = (e,index) => {
    e.preventDefault()
    this.setState({
      visible: true,
      addingName: this.state.dataSource[index].description,
      deviceType: this.state.dataSource[index].deviceType.toString(),
      editing: true,
      editingIndex: index
    })
  }
  delete = (e,index) => {
    e.preventDefault()
    let resource='/api/device/component/type/delete'
    const body = {
      id: this.state.dataSource[index].id
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const body={
            page: this.state.page,
            size: SIZE
          }
          this.fetchData(body)
        }else{
          Noti.hintError('当前项不能被删除','请咨询相关人员！')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  checkProblem = (e) => {
    let v = e.target.value.trim()
    if(!v){
      return this.setState({
        addingName: v,
        typeError: true
      })
    }
    this.setState({
      addingName: v,
      typeError: false
    })
  }
  changeDevice = (v) => {
    this.setState({
      deviceType: v
    })
  }
  checkDevice = (v) => {
    if (!v || v==='0') {
      return this.setState({
        dtError: true
      })
    }
    this.setState({
      dtError: false
    })
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
    let {editing, page, total, loading, dataSource} = this.state 
    return (
      <div className='contentArea'>
        <SearchLine openTitle='添加配件类型' openModal={this.addProblem} />

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
          <div>
            <Modal
              title="添加配件类型"
              visible={this.state.visible}
              onOk={this.postCpType}
              onCancel={this.cancelPost}
              maskClosable={false}
              className='addSupplierModal'
            >
              <div className='contentWrapper'>
                <label >设备类型:</label>
                <div className='contentValue'>
                  <DeviceWithoutAll 
                    selectedDevice={this.state.deviceType} 
                    width={150} 
                    changeDevice={this.changeDevice} 
                    checkDevice={this.checkDevice}
                    disabled={editing}
                    className={editing ? 'disabled' : ''}
                  />
                  {this.state.dtError?<span className='checkInvalid'>设备类型不能为空!</span>:null}
                </div>
              </div>
              <div className='contentWrapper' >
                <label htmlFor='name' >类型名称:</label>
                <div className='contentValue'>
                  <input  id='name' value={this.state.addingName} onChange={this.changeAddingName} onBlur={this.checkProblem} />
                  {this.state.typeError?<span className='red'>类型不能为空!</span>:null}
                </div>
              </div>
            </Modal>
          </div>
      </div>
    )
  }
}

export default ComponentType
