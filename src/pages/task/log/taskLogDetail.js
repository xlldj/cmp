import React from 'react'
import {Button, Modal, Table, Popconfirm} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import Time from '../../component/time'
import CONSTANTS from '../../component/constants'
import PicturesWall from '../../component/picturesWall'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
const FILEADDR = CONSTANTS.FILEADDR
const TASKTYPES = {
  1: '工作记录',
  2: '指派任务'
}

class TaskLogDetail extends React.Component {
  constructor (props) {
    super(props)
    let id = '', type = '', typeError = ''
    let brief = '', briefError = false, description='',descriptionError=false, fileList = []
    let schoolId = '', schoolError = false
    this.state = {id, type, typeError, brief, briefError,
      description, descriptionError, fileList,
      schoolId, schoolError,
      repairmanId: '',
      repairmanName: '',
      repairmanError: false,
      showModal: false,
      schoolName: '',
      priority: '',
      remark: '',
      needToast: false,
      status: '', 
      showRepairmanName: true // only useful when status === 6
    }
  }
  componentDidMount(){
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = this.props.match.params.id.slice(1)
      let resource = '/api/work/note/one'
      const body = {
        id: parseInt(id, 10)
      }
      const cb = (json) => {
        if(json.error){
          throw new Error(json.error)
        }else{
          let data = json.data,fileList=[]
          const nextState = { 
            id: data.id,
            brief: data.brief,
            description: data.description || ''
          }
          if (data.status) {
            nextState.status = data.status
            if (data.status === 6) {
              nextState.showRepairmanName = false
            }
          }
          if (data.type) {
            nextState.type = data.type.toString()
          }
          if (data.schoolId) {
            nextState.schoolId = data.schoolId
          }
          if (data.userId) {
            nextState.repairmanId = data.userId
          }
          if (data.assignName) {
            nextState.repairmanName = data.assignName
          }
          if (data.level) {
            nextState.priority = data.level
          }
          if (data.remark) {
            nextState.remark = data.remark
          }
          if(data.images&&data.images.length>0){
            data.images.forEach((r,i)=>{
              fileList.push({
                uid:i-10,
                status: 'done',
                url: FILEADDR + r
              })
            })
            nextState.fileList = fileList
          }
          this.setState(nextState)
        }
      }
      AjaxHandler.ajax(resource,body,cb)
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  changeBrief = (e) => {
    this.setState({
      brief: e.target.value
    })
  }
  checkBrief = (e) => {
    let v = e.target.value.trim()
    if(!v){
      return this.setState({
        brief: v,
        briefError: true
      })
    }
    let nextState = {
      brief: v
    }
    if(this.state.briefError){
      nextState.briefError = false
    }
    this.setState(nextState)
    this.updateToast()
  }
  changeDescription = (e) => {
    let v = e.target.value
    this.setState({
      description: v
    })
  }
  checkDescription = (e) => {

    let v = e.target.value.trim()
    if(!v){
      return this.setState({
        description: v,
        descriptionError: true
      })
    }
    let nextState = {
      description: v
    }
    if(this.state.descriptionError){
      nextState.descriptionError = false
    }
    this.setState(nextState)
    this.updateToast()
  }
  postInfo = () => {
    const {id, brief, description, fileList, type, schoolId, repairmanId, priority, remark} = this.state
    let resource
    const body = {brief, description}
    body.type = parseInt(type, 10)
    if (type === '2') {
      body.schoolId = parseInt(schoolId, 10)
      body.repairmanId = parseInt(repairmanId, 10)
      body.level = parseInt(priority, 10)
      body.remark = remark
    }
    if(fileList.length>0){
      let images = fileList.map((r,i)=>(r.url.replace(FILEADDR, '')))
      body.images = images
    }
    if(id){
      body.id = id
      resource = '/api/work/note/update'
    }else{
      resource = '/api/work/note/add'
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error)
      }else{
        Noti.hintSuccess(this.props.history,'/task/log')
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  handleSubmit = () => {
    if(!this.state.brief){
      return this.setState({
        briefError: true
      })
    }
    if(!this.state.description){
      return this.setState({
        descriptionError: true
      })
    }
    if (!this.state.type) {
      return this.setState({
        typeError: true
      })
    }
    if (this.state.type === '2') {
      if (!this.state.schoolId) {
        return this.setState({
          schoolError: true
        })
      }
      if (!this.state.repairmanId) {
        return this.setState({
          repairmanError: true
        })
      }
    }
    this.postInfo()
  }
  cancelSubmit = () => {
    this.props.history.goBack()
  }
  setImages = (fileList) => {
    this.setState({
      fileList: JSON.parse(JSON.stringify(fileList))
    })
  }
  changeType = (v) => {
    this.setState({
      type: v
    })
  }
  checkType = (v) => {
    if (!v) {
      return this.setState({
        typeError: true
      })
    }
    if (this.state.typeError) {
      this.setState({
        typeError: false
      })
    }
    if (v === '2') {
      this.updateToast()
    }
  }
  changeSchool = (id, name) => {
    this.setState({
      schoolId: id,
      schoolName: name
    })
  } 
  checkSchool = (v) => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    if (this.state.schoolError) {
      this.setState({
        schoolError: false
      })
    }
    this.updateToast()
  }
  showAllocate = () => {
    this.setState({
      showModal: true
    })
  }
  cancel = () => {
    this.setState({
      showModal: false
    })
  }
  setMaintainer = (id, name, priority, remark) => {
    this.setState({
      repairmanId: id,
      repairmanName: name,
      priority: priority,
      remark: remark,
      showModal: false,
      showRepairmanName: true
    })
    this.updateToast({repairmanId: id})
  }
  updateToast (info) {
    let {id, type, brief, description, schoolId, repairmanId} = {...this.state, ...info}
    let needToast = true, nextState = {}
    if (id || type !== '2' || !brief || !description || !schoolId || !repairmanId) {
      needToast = false
    }
    nextState.needToast = needToast
    this.setState(nextState)
  }
  render () {
    const {id, type, typeError, brief, briefError,description, 
      descriptionError, fileList,
      schoolId, schoolError, schoolName,
      showModal,
      repairmanName, repairmanError,
      priority, remark,
      status, showRepairmanName,
      needToast
    } = this.state

    return (
      <div className='infoList' >
        <div className='info takLogInfo'>
          <ul>
            <li>
              <p>工单类型：</p>
              <BasicSelector
                width={CONSTANTS.SELECTWIDTH}
                disabled={id}
                className={id ? 'disabled' : ''}
                invalidTitle='选择类型'
                staticOpts={TASKTYPES}
                selectedOpt={type}
                changeOpt={this.changeType} 
                checkOpt={this.checkType} 
              />
              {typeError && (<span className='checkInvalid'>类型不能为空！</span>)}
            </li>
            {type.toString() === '2' ?
               <li>
                <p>学校：</p>
                <SchoolSelector
                  width={CONSTANTS.SELECTWIDTH}
                  disabled={id}
                  className={id ? 'disabled' : ''}
                  invalidTitle='选择学校'
                  selectedSchool={schoolId}
                  changeSchool={this.changeSchool}
                  checkSchool={this.checkSchool}
                />
                {schoolError && (<span className='checkInvalid'>学校不能为空！</span>)}
              </li>
              : null
            }
            <li>
              <p>一句话描述：</p>
              <input value={brief} onChange={this.changeBrief}
                disabled={type === '2' && id}
                className={type === '2' && id ? 'disabled' : ''}
                onBlur={this.checkBrief} />
              {briefError && (<span className='checkInvalid'>描述不能为空</span>)}
            </li>
            <li className='itemsWrapper'>
              <p>具体描述：</p>
              <textarea value={description}
                disabled={type === '2' && id}
                className={type === '2' && id ? 'disabled' : ''}
                onChange={this.changeDescription}  
                onBlur={this.checkDescription} 
              />
              {descriptionError && (<span className='checkInvalid'>描述不能为空</span>)}
            </li>
            <li className='imgWrapper'>
              <p>图片：</p>
              <div className='upload' >
                <PicturesWall disabled={id ? true : false} setImages={this.setImages} fileList={fileList} dir='work-log' />
              </div>
            </li>
            {type.toString() === '2' ?
               <li>
                <p>选择维修员：</p>
                {showRepairmanName ? <span>{repairmanName}</span> : null}
                {id ? null : <Button type='primary' onClick={this.showAllocate}>指派维修员</Button>}
                {id && status === 6 ? <Button type='primary' onClick={this.showAllocate}>重新指派维修员</Button> : null}
                {repairmanError && (<span className='checkInvalid'>请指派维修员！</span>)}
              </li>
              : null
            }
          </ul>
        </div>

        <div className='btnArea'>
          {status !== 6 && type === '2' && id ? null : <Button type='primary'  onClick={this.handleSubmit} >确认</Button>}
          {
            needToast ?
              <Popconfirm title="当前任务还未发布，确定要返回么?" onConfirm={this.cancelSubmit} okText="确认" cancelText="取消">
                <Button >返回</Button>
              </Popconfirm>
            : 
              <Button onClick={this.cancelSubmit} >返回</Button>
          }
        </div>

        <RepairmanTable showModal={showModal} setMaintainer={this.setMaintainer} cancel={this.cancel}
         priority={priority} remark={remark} schoolId={schoolId} schoolName={schoolName} />

      </div>
    )
  }
}


class RepairmanTable extends React.Component{
  constructor(props){
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      selectedRowKeys: '',
      priority: '1',
      remark: '',
      schoolId: 0
    }
  }
  fetchData = (body) => {
    let resource='/api/employee/repairman/list'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.setState({
              dataSource: json.data.repairmans
            })
          }       
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentWillReceiveProps (nextProps) {
    let {schoolId, priority, remark} = nextProps
    if (schoolId && schoolId !== this.state.schoolId) {
      this.setState({
        schoolId: schoolId
      })
      const body = {
        schoolId: parseInt(schoolId, 10),
        page: 1,
        size: 10000
      }
      this.fetchData(body)
    }
    if (priority && priority !== this.state.priority) {
      this.setState({
        priority: priority
      })
    }
    if (remark && remark !== this.state.remark) {
      this.setState({
        remark: remark
      })
    }
  }
  changeSelect = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys: [selectedRows[0].userId]
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
  confirm = () => {
    let id = this.state.selectedRowKeys[0]
    let name = this.state.dataSource.find((r) => (r.userId === id)).username
    this.props.setMaintainer(id, name, this.state.priority, this.state.remark)
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
    const columns = [{
      title: '维修员',
      dataIndex: 'username',
      width: '15%'
    }, {
      title: '待接受的任务',
      dataIndex: 'waiting',
      width: '15%',
    }, {
      title: '已接受的任务',
      dataIndex: 'accepted',
      width: '15%'
    }, {
      title: '近7日完成任务',
      dataIndex: 'weeklyDone',
      width: '20%'
    }, {
      title: '平均完成时间',
      dataIndex: 'avgCost',
      width: '20%',
      render: (text,record,index) => {
        return Time.formatSpan(record.avgCost)
      }
    }, {
      title: '用户评分',
      dataIndex: 'avgRating',
      width: '15%'
    }]
    const title = (
      <span className='modalTitle' >指派维修员</span>
    )

    return (
      <Modal wrapClassName='modal' width={800} title={title} visible={this.props.showModal} onCancel={this.cancel} onOk={this.confirm} okText='确认指派'>
        <div className='schName'>当前指派学校:{this.props.schoolName}</div>
        <div className='setRepairman'>
          <Table rowKey={record=>record.userId}  onRowClick={this.selectRow} rowSelection={{type:'radio', onChange:this.changeSelect, selectedRowKeys: selectedRowKeys}} pagination={{defaultPageSize:8}} dataSource={dataSource} columns={columns} />
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

export default TaskLogDetail
