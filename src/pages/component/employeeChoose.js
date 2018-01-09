import React from 'react'
import {Modal, Table, Button} from 'antd'
import Noti from '../noti'
import CONSTANTS from './constants'
import AjaxHandler from '../ajax'

class EmployeeChoose extends React.Component{
  constructor(props){
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      selectedRowKeys: '',
      priority: '1',
      remark: '',
      schoolId: 0,
      posting: false
    }
  }
  fetchData = () => {
    let {department, schoolId} = this.props
    let resource = '/api/employee/department/member/list'
    const body = {
      page: 1,
      size: 10000
    }
    if (schoolId) {
      body.schoolId = schoolId
    }
    if (department) {
      body.department = department
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          this.setState({
            dataSource: json.data.employees
          })
        }     
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount () {
    let {schoolId, level} = this.props
    let nextState = {}
    if (schoolId) {
      nextState.schoolId = schoolId
    } 
    if (level) {
      nextState.priority = level
    }
    this.fetchData()
  }
  componentWillReceiveProps (nextProps) {
    let {schoolId, level} = nextProps
    if (schoolId && schoolId !== this.state.schoolId) {
      this.setState({
        schoolId: schoolId
      })
      this.fetchData()
      this.props = nextProps
    }
  }
  changeSelect = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: [selectedRows[0].id]
    })
  }
  changePriority = (e) => {
    let node = e.target, v = ''
    let priority = this.state.priority
    try {
      while (node.tagName.toLowerCase() !== 'button') {
        node = node.parentNode
      }
      v = node.getAttribute('data-value')
    } catch (e) {
      console.log(e)
    }
    if (priority === v) {
      return
    }
    this.setState({
      priority: v
    })
  }
  cancel = () => {
    this.props.cancel()
  }
  postData = (body) => {
    let resource='/api/work/order/handle'
    const cb = (json) => {
      this.setState({
        posting: false
      })
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        /*--------redirect --------*/
        if(json.data){
          this.props.confirm()
        }       
      }
    }
    AjaxHandler.ajax(resource,body,cb, null, {clearPosting: true, thisObj: this})
  }
  confirm = () => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })
    const body = {
      type: CONSTANTS.TASK_HANDLE_REASSIGN,
      id: this.props.id,
      department: this.props.department,
      level: parseInt(this.state.priority, 10),
      assignId: this.state.selectedRowKeys[0],
      content: this.state.remark
    }
    this.postData(body)
  }
  changeRemark = (e) => {
    this.setState({
      remark: e.target.value
    })
  }
  checkRemark = (e) => {
    let v = e.target.value.trim()
    this.setState({
      remark: v
    })
  }
  selectRow = (record, index, event) => {
    let selectedRows = [record]
    this.changeSelect(null, selectedRows)
  }
  render(){
    const {dataSource, priority, selectedRowKeys} = this.state
    const {department} = this.props
    const columns = [{
      title: <span className='inlineWidth100 rightAlign'>名称</span>,
      dataIndex: 'name',
      className: 'rightAlign',
      width: '80%'
    }]
    const title = (
      <span className='modalTitle' >{CONSTANTS.EMPLOYEE_TYPE[department]}</span>
    )

    return (
      <Modal 
        wrapClassName='modal' 
        width={640} 
        title={title} 
        visible={this.props.showModal} 
        onCancel={this.cancel} 
        onOk={this.confirm} 
        okText='确认'
      >
        <div className='schName'>学校:{this.props.schoolName}</div>
        <div className='setRepairman'>
          <Table 
            rowKey={record=>record.id}  
            onRowClick={this.selectRow} 
            rowSelection={{type:'radio', onChange:this.changeSelect, selectedRowKeys: selectedRowKeys}} 
            pagination={{defaultPageSize:8}} 
            dataSource={dataSource} 
            columns={columns} 
          />
          <div className='options'>
            <div className='priorityGroup'>
              <span>任务紧急程度:</span>
              <Button type={priority==='1'?'primary':''} onClick={this.changePriority} data-value='1' >正常处理</Button>
              <Button type={priority==='2'?'primary':''}  onClick={this.changePriority} data-value='2' >优先处理</Button>
              <Button type={priority==='3'?'primary':''}  onClick={this.changePriority} data-value='3' >紧急处理</Button>
            </div>
            <div className='customNote'>
              <textarea placeholder='备注信息(选填)' className='noteInput' value={this.state.remark} onChange={this.changeRemark} onBlur={this.checkRemark} />
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default EmployeeChoose