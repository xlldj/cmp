import React from 'react'
import { Link} from 'react-router-dom'

import {Button, Popconfirm, Tabs, Collapse} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import {setStore, getStore} from '../../util/storage'

const Panel = Collapse.Panel
const TabPane = Tabs.TabPane

class BlockManage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: [],
      schoolId: 0,
      schoolName: ''
    }
  }
  fetchData = (body) => {
    let resource='/api/residence/list'
    const cb = (json) => {
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          this.setState({
            data: json.data.residences,
            schoolName: json.data.schoolName
          })
        }          
      }
    }
    AjaxHandler.ajax(resource,body,cb)  
  }
  componentDidMount(){
    let id 
    this.props.hide(false)
    if (this.props.match.params.id) {
      id = parseInt(this.props.match.params.id.slice(1), 10)
      this.setState({
        schoolId: id
      })
      setStore('schoolIdOfBlock', id) // 为了点击面包屑时仍然获得当前操作的学校id
    } else {
      id = getStore('schoolIdOfBlock')
    }
    const body = {
      page: 1,
      size: 1000,
      schoolId: id,
      residenceLevel: 1
    }
    this.fetchData(body)
    this.fetchName(id)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  fetchName = (id) => {
    let resource = '/school/one'
    const body = {
      id: id
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        let name = json.data.name
        this.setState({
          schoolName: name
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  deleteBlock = (e,id) => {
    e.preventDefault()
    e.stopPropagation()
      let resource=`/api/residence/delete`
      const body = {
        id: parseInt(id, 10)
      }
      const cb = (json) => {
        if(json.data){
          const body = {
            lastId:0,
            limit: 10000,
            schoolId: this.state.schoolId
          }
          this.fetchData(body)
        }else{
          Noti.hintLock('该楼栋不能被删除！','请将该楼设备清除后再尝试删除！')
        }
      }
      AjaxHandler.ajax(resource,body,cb)     
  }

  //this is used to stop the panel expanding
  alertDelete = (e) => {
    e.stopPropagation()  
  }

  render (){
    const {data} = this.state
    const panels = data.map((block,index) => {
      const head = (
        <div key={`header${index}`}  className='panelHeader' >
          <span >{block.residence.name}</span>
          <span className='editLink'>
            <Link  to={'/school/list/blockManage/editingBlock/:'+block.residence.id} >编辑</Link>
            <span className='ant-divider' />
            <Popconfirm title="确定要删除此楼么?" onClick={this.alertDelete} onConfirm={(e) => {this.deleteBlock(e,block.residence.id)}} okText="确认" cancelText="取消">
              <a href="#">删除</a>
            </Popconfirm>
          </span>
        </div>
      )
      const content = block.children.map((floor,ind) => {
        const roomDetail = floor.children.map((room,i) => {
          let heater = room.devices.find((r,index)=>(r.type===1))
          let water = room.devices.find((r,index)=>(r.type===2))
          return(
            <div key={`divblock${block.residence.id}floor${floor.residence.id}${room.residence.id}`} className='roomItem'>
              <span key={`spanblock${block.residence.id}floor${floor.residence.id}${room.residence.id}`} >{room.residence.name}</span>
              <span>{heater?heater.hardwareNo:'暂无'}</span>
              <span>{water?water.hardwareNo:'暂无'}</span>
            </div>
          )
        })
        let n=floor.residence.name
        return (
          <TabPane tab={n} key={ind}>
            <div className='roomTable'>
              <div key={`div${ind}`} className='roomItem roomHeader'>
                <span key={`room${ind}`}>宿舍号/位置</span>
                <span key={`heater${ind}`}>热水器编号</span>
                <span key={`water${ind}`}>饮水机编号</span>
              </div>
              <div className='roomList'>{roomDetail}</div>
            </div>
          </TabPane>
        )
      })
      return (
        <Panel header={head} key={`${index}block`} >
          <Tabs tabPosition='left'>{content}</Tabs>
        </Panel>
      )
    })

    return (
      <div className='blockManage contentArea'>
        <div className='nameHeader'>
          <div className='schoolName'>当前管理的学校：{this.state.schoolName}</div>
          <div><Link to='/school/list/blockManage/addingBlock' ><Button type='primary'>添加楼栋</Button></Link></div>
        </div>
        <Collapse accordion >
          {panels}
        </Collapse>
      </div>
    )
  }
}

export default BlockManage
