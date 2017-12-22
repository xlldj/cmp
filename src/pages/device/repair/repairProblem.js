import React from 'react'

import {Table, Popconfirm, Modal} from 'antd'

import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import DeviceSelector from '../../component/deviceWithoutAll'
import Time from '../../component/time'
import CONSTANTS from '../../component/constants'

const DEVICETYPE = CONSTANTS.DEVICETYPE
const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class RepairProblem extends React.Component {
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      visible: false,
      addingName: '',
      deviceType: 0,
      editing: false,
      editingIndex: '',
      lengthError: false,
      empty: false,
      loading: false,
      page: 1,
      total: 0
    }
    this.columns = [{
      title: '常见问题选项内容',
      dataIndex: 'description',
      width: '25%',
      className: 'firstCol'
    }, {
      title: '设备类型',
      dataIndex: 'deviceType',
      width: '25%',
      render: (text) => (DEVICETYPE[text])
    },{
      title: '创建时间',
      dataIndex: 'createTime',
      width: '25%',
      render: (text, record) => (Time.getTimeStr(record.createTime))
    },{
      title: (<p className='lastCol'>操作</p>),
      dataIndex: 'operation',
      render: (text, record, index) => (
        <div className='editable-row-operations lastCol'>
          <span>
            <a href='' onClick={(e) => {this.edit(e,index)}}>编辑</a>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此么?" onConfirm={(e) => {this.delete(e,index)}} okText="确认" cancelText="取消">
              <a href="">删除</a>
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
    let resource='/api/repair/cause/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          const data = json.data.repairCauses.map((s,i) => {
            s.key = s.id
            return s
          })
          nextState.dataSource = data
          nextState.total = json.data.total
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
  postProblem = () => {
    //save it to the list and post the info to the server
    if (!this.state.deviceType) {
      return this.setState({
        deviceTypeError: true
      })
    }
    if(this.state.addingName.length>5){
      return this.setState({
        lengthError: true
      })
    }
    if (!this.state.addingName) {
      return this.setState({
        empty: true
      })
    }
    const body = {
      description: this.state.addingName,
      deviceType: parseInt(this.state.deviceType, 10 )
    }
    let resource
    if(this.state.editing){
      resource = '/api/repair/cause/update'
      this.setState({
        visible: false,
        addingName: '',
        deviceType: 0,
        editing: false
      })
      /*-----------update the data into the database-----------*/
      body.id = this.state.dataSource[this.state.editingIndex].id
      /*-----------dosen't need to fetch data again------------*/
      
    }else{
      resource = '/api/repair/cause/add'
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
            Noti.hintLock('该选项已经添加','请重新输入选项！')
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
      deviceType: '',
      editing: false,
      lengthError: false
    })    
  }
  changeAddingName = (e) => {
    this.setState({
      addingName: e.target.value
    })
  }
  edit = (e,index) => {
    //open the modal with the data
    e.preventDefault()
    this.setState({
      visible: true,
      addingName: this.state.dataSource[index].description,
      deviceType: this.state.dataSource[index].deviceType,
      editing: true,
      editingIndex: index
    })
  }
  delete = (e,index) => {
    e.preventDefault()
    let resource='/api/repair/cause/delete'
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
            Noti.hintError('当前选项不能被删除','请咨询相关人员！')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  checkProblem = (e) => {
    let v = e.target.value.trim()
    let nextState = {
      addingName: v
    }
    if(v.length > 5){
      nextState.lengthError = true
    } else {
      nextState.lengthError = false
    }
    if (!v) {
      nextState.empty = true
    } else {
      nextState.empty = false
    }
    this.setState(nextState)
  }
  changeDevice = (v) => {
    this.setState({
      deviceType: v
    })
  }
  checkDevice = (v) => {
    if (v && this.state.deviceTypeError) {
      this.setState({
        deviceTypeError: false
      })
    }
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
    const {editing, deviceType, deviceTypeError, page, total, loading, dataSource} = this.state
    return (
      <div className='contentArea'>
        <SearchLine openTitle='添加' openModal={this.addProblem} />

          <div className='tableList'>
            <Table bordered
              loading={loading} rowKey={(record)=>(record.id)} pagination={{pageSize: SIZE, current: page, total: total}} onChange={this.changePage}  dataSource={dataSource} columns={this.columns} />
          </div>
          <div>
            <Modal
              title="添加问题选项"
              visible={this.state.visible}
              onOk={this.postProblem}
              onCancel={this.cancelPost}
              maskClosable={false}
              className='addSupplierModal'
            >
              <div className='device'>
                <label>请选择设备类型:</label>
                <DeviceSelector 
                  width='145px'
                  selectedDevice={deviceType&&deviceType.toString()} 
                  changeDevice={this.changeDevice}
                  checkDevice={this.checkDevice}
                  disabled={editing}
                  className={editing ? 'disabled' : ''} 
                />
                {deviceTypeError ? <span className='red'>设备类型不能为空！</span> : null}
              </div>

              <div className='question'>
                <label >请输入问题描述：</label>
                <input  placeholder='请勿超过5个字！' name='name' id='name' value={this.state.addingName} onChange={this.changeAddingName} onBlur={this.checkProblem} />
                {this.state.lengthError?<span className='red'>问题描述不能超过5个字!</span>:null}
                {this.state.empty?<span className='red'>问题描述不能为空!</span>:null}
              </div>
            </Modal>
          </div>
      </div>
    )
  }
}

export default RepairProblem
