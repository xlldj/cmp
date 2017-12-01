import React from 'react'
import {Link} from 'react-router-dom'
import AjaxHandler from '../../ajax'
import { Button, Modal, Table, Carousel, Input, Popconfirm } from 'antd'
import Time from '../../component/time'
import CONSTANTS from '../../component/constants'
import Noti from '../../noti'
const { TextArea } = Input;
const typeName = CONSTANTS.DEVICETYPE
const STATUS = CONSTANTS.REPAIRSTATUSFORSHOW
const PRIORITY = CONSTANTS.PRIORITY
const BACKTITLE = {
  fromTask:'返回客服工单',
  fromDevice:'返回设备详情',
  fromRepairLog: '返回用户报修记录'
}

class RepairInfo extends React.Component {
  constructor (props) {
    super(props)
    let data = {
        'device': {
          'schoolName': '',
          'hardwareNo': '',
          'location': ''
        },
        'content': {
          'content': '',
          'images': [],
          'committerName': '',
          'committerMobile': ''
        },
        'status': {
          'status': '',
          'commitTime': ''
        },
        'repairman': {
          'mobile': '',
          'level': '',
          'name': ''
        }
      }
    let showModal = false, showImgs=false, initialSlide=0, showCensor=false, failedReason=''
    this.state = {data, showModal, showImgs, initialSlide, showCensor, failedReason}
  }
  fetchData = (body) => {
    let resource='/api/repair/one'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.setState({
              data: json.data
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    const body = {
      id: parseInt(this.props.match.params.id.slice(1))
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  showAllocate = () => {
    this.setState({
      showModal: true
    })
  }
  close = () => {
    this.setState({
      showModal:false
    })
  }
  showImgs = (e) => {
    console.log(e.target.value)
    this.setState({
      showImgs: true,
      initialSlide: e.target.value
    })
  }
  closeImgs = () => {
    this.setState({
      showImgs: false
    })
  }
  confirmPost = () => {
    this.setState({
      showModal: false
    })
    const body = {
      id: parseInt(this.props.match.params.id.slice(1))
    }
    this.fetchData(body)
  }
  cancel = () => {
    this.setState({
      showModal: false
    })
  }
  postFail = () => {
    let resource = '/api/work/sheet/censor'
    const body = {
      pass: 2,
      sourceId: parseInt(this.props.match.params.id.slice(1)),
      sourceType: 2,
      reason: this.state.failedReason
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          const body = {
            id: parseInt(this.props.match.params.id.slice(1))
          }
          this.fetchData(body)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  censorFail = () => {
    this.setState({
      showCensor: true
    })
  }
  censorSuccess = () => {
    let resource = '/api/work/sheet/censor'
    const body = {
      pass: 1,
      sourceId: parseInt(this.props.match.params.id.slice(1)),
      sourceType: 2
    }
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          const body = {
            id: parseInt(this.props.match.params.id.slice(1))
          }
          this.fetchData(body)
          Noti.hintOk('操作成功', '该任务已通过审核')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeFailReason = (e) => {
    this.setState({
      failedReason: e.target.value
    })
  }
  cancelCensor = () => {
    this.setState({
      showCensor: false
    })
  }
  confirmCensor = () => {
    this.setState({
      showCensor: false
    })
    this.postFail()
  }
  render () {
    const {device,content,status,repairman,repairRating} = this.state.data
    let {showCensor, failedReason} = this.state.data

    const images = content.images.map((r,i) => {
      return <img onClick={this.showImgs} value={i}  key={i} src={CONSTANTS.FILEADDR + r} className='repairImg' />
    })

    const carouselItems = content.images.map((r,i) => {
      return <img value={i}  key={i} src={CONSTANTS.FILEADDR + r} className='carouselImg' />
    })
    const carousel = (<Carousel style={{backgroundColor:'red'}}  dots={true} accessibility={true}  className='carouselItem' autoplay={true} arrows={true} initialSlide={this.state.initialSlide}>
                        {carouselItems}
                      </Carousel>)

    //handle the time 
    let applyTS = Time.getTimeStr(status.commitTime)

    let stopT = status.status===7 ? new Date(status.finishedTime) : (status.status === 5 ? new Date(status.censorTime) : new Date())
    let timePassed = Time.getTimeInterval(status.commitTime, stopT.getTime())

    let levelClass = repairman && (repairman.level === 3 ? 'red' : (repairman.level === 2 ? 'yellowfc' : ''))

    let waitingClass = (status.status === 1 || status.status === 2 || status.status === 5 || status.status === 6)?'waiting':(status.status===7?'finished':'repairing')

    const repairmanInfo = (status.status===4 || status.status===3 || status.status===6 || status.status===7)&&(
      <div className='infoBlock halfWidth rightBlock'>
        <h3>维修员信息</h3>
        <ul>
          <li><p>维修员:</p>{repairman.name}</li>
          <li><p>维修员电话:</p>{repairman.mobile}</li>
          <li><p>任务紧急程度:</p><span className={levelClass}>{PRIORITY[repairman.level]}</span></li>
          {status.status===6?<li><p>拒绝原因:</p><span className='width200'>{repairman.refuseReason || '暂无'}</span></li>:null}
          {status.status===7?<li><p>使用配件:</p><span className='width200'>{repairman.components || '暂无'}</span></li>:null}
          {status.status===7?<li><p>维修结论:</p><span className='width200'>{repairman.conclusion || '暂无'}</span></li>:null}
        </ul>
      </div>)

    let censorBtn = (
      <div className='btnArea'>
        <Button onClick={this.censorFail}>审核未通过</Button>
        <Popconfirm title="确定要通过么?" onConfirm={this.censorSuccess} okText="确认" cancelText="取消">
          <Button type='primary'>审核通过</Button>
        </Popconfirm>
        { this.props.location.state ? <span className='divider'></span> : null }
        { this.props.location.state ? 
            <Button onClick={this.back}>{BACKTITLE[this.props.location.state]}</Button>
          : null 
        }
      </div>
    )
    let assignBtn = (
      <div className='btnArea'>
        {status.status===2?<Button type='primary' onClick={this.showAllocate}>指派维修员</Button>:null}
        {status.status===6?<Button type='primary' onClick={this.showAllocate}>重新指派维修员</Button>:null}
        { this.props.location.state ? <span className='divider'></span> : null }
        { this.props.location.state ? 
            <Button onClick={this.back}>{BACKTITLE[this.props.location.state]}</Button>
          : null 
        }
      </div>
    )

    let rateInfo =  repairRating && (
      <div className='infoBlock halfWidth rightBlock'>
        <h3>用户评价</h3>
        <ul>
          <li><p>用户评分:</p>{repairRating.rating}</li>
          <li><p>快捷评价:</p>{repairRating.ratingOption}</li>
          <li className='itemsWrapper'><p>评价内容:</p><div className='paragraph'>{repairRating.ratingContent}</div></li>
        </ul>
      </div>
    )

    return (
      <div className='infoBlockList repairInfo columnLayout' >
        <div className='infoBlock halfWidth'>
          <h3>设备信息</h3>
          <ul>
            <li><p>学校名称:</p>{device.schoolName}</li>
            <li><p>设备类型:</p>{typeName[device.deviceType]}</li>
            <li><p>设备位置:</p>{device.location}</li>
          </ul>
        </div>

        <div className='infoBlock halfWidth'>
          <h3>报修内容</h3>
          <ul>
            <li className='itemsWrapper'><p>设备问题:</p><div>{content.cause || '暂无'}</div></li>
            <li className='itemsWrapper'><p>报修内容:</p><div>{content.content || '暂无'}</div></li>
            { images.length > 0 ?
              <li className='imgWrapper'><p>报修图片:</p>
                {images}
              </li>
              : null
            }
            <li><p>报修人电话:</p>{content.committerMobile || '暂无'}</li>
            <li>
              <p>报修用户:</p>
              <span className='padR20'>{content.committerName}</span>
              <Link to={{pathname: `/device/repair/userRepairLog/:${content.committerId}`, state: {username: content.committerName}}}>用户报修记录</Link>
            </li>
            <li>
              <p>系统判定:</p>{content.systemJudgment|| '暂无'}
            </li>
          </ul>
        </div>

        <div className='infoBlock halfWidth rightBlock'>
          <h3>报修状态</h3>
          <ul>
            <li><p>报修状态:</p><span className={waitingClass}>{STATUS[status.status]}</span></li>
            <li><p>用户申请时间:</p>{applyTS}</li>
            <li><p>用户{status.status===7 || status.status=== 5 ? '' : '已'}等待时间:</p>{timePassed}</li>
            {status.status > 1 ? <li><p>审核时长:</p>{Time.getTimeInterval(status.commitTime, status.censorTime) ||'信息不全'}</li>:null}
            {status.status !== 5 && status.status > 2 ? <li><p>指派时长:</p>{Time.getTimeInterval(status.censorTime, status.assignTime) ||'信息不全'}</li>:null}
            {status.status===4?<li><p>维修时长:</p>{Time.getSpan(status.acceptTime) ||'信息不全'}</li>:null}
            {status.status===7?<li><p>维修用时:</p>{Time.getTimeInterval(status.acceptTime, status.finishedTime)||'信息不全'}</li>:null}
            {status.status===7?<li><p>维修完成时间:</p>{Time.getTimeStr(status.finishedTime)||'信息不全'}</li>:null}
            {status.status === 5 ? <li><p>未通过原因:</p>{status.remark || '暂无'}</li> : null}
          </ul>
        </div>

        {status.status === 1 ?censorBtn:null}


        {repairmanInfo}

        {status.status === 2 || status.status === 6 ? assignBtn : null}

        {status.status === 7 ? rateInfo : null}

        { status.status === 3 || status.status === 4 || status.status === 5 || status.status === 7 ? 
          <div className='btnArea'>
            <Button onClick={this.back}>{this.props.location.state?BACKTITLE[this.props.location.state]:'返回'}</Button>
          </div> 
          : null 
        }

        <RepairmanTable showModal={this.state.showModal} confirm={this.confirmPost} cancel={this.cancel} id={parseInt(this.props.match.params.id.slice(1))} schoolId={device.schoolId} schoolName={device.schoolName} />

        <Modal  visible={this.state.showImgs}  title='' closable={false} onCancel={this.closeImgs} width={800} className='carouselModal' okText='' footer={null} >
          <div className='carouselContainer' >{this.state.showImgs?carousel:null}</div>
        </Modal>

        <Modal wrapClassName='censorModal' title='未通过原因' maskClosable={true} visible={this.state.showCensor} onCancel={this.cancelCensor} onOk={this.confirmCensor} okText='确认'>
          <textarea className='censorInput' value={failedReason} placeholder='此原因用于展示给用户' onChange={this.changeFailReason} />
        </Modal>
        
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
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentWillReceiveProps (nextProps) {
    let schoolId = nextProps.schoolId
    if (schoolId && schoolId !== this.state.schoolId) {
      this.setState({
        schoolId: schoolId
      })
      const body = {
        schoolId: schoolId,
        page: 1,
        size: 10000
      }
      this.fetchData(body)
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
  postData = (body) => {
    let resource='/api/repair/assign'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            this.props.confirm()
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  confirm = () => {
    const body = {
      id: this.props.id,
      level: parseInt(this.state.priority),
      repairmanId: this.state.selectedRowKeys[0],
      remark: this.state.remark
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
        <div className='schName'>当前报修设备学校:{this.props.schoolName}</div>
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

export default RepairInfo
