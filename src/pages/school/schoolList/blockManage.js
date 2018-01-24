import React from 'react'
import { Link } from 'react-router-dom'

import { Button, Popconfirm, Tabs, Collapse } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import { setStore, getStore } from '../../util/storage'

const Panel = Collapse.Panel
const TabPane = Tabs.TabPane
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}

class BlockManage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      schoolId: 0,
      schoolName: '',
      loading: false,
      fetchingIndex: 0
    }
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/residence/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          nextState.data = json.data.residences
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    let id,
      nextState = {}
    this.props.hide(false)

    // 是否来自学校信息设置页
    let path = this.props.location.state && this.props.location.state.path
    if (path === 'fromInfoSet') {
      nextState.fromInfoSet = true
    }

    if (this.props.match.params.id) {
      id = parseInt(this.props.match.params.id.slice(1), 10)
      setStore('schoolIdOfBlock', id) // 为了点击面包屑时仍然获得当前操作的学校id
    } else {
      id = getStore('schoolIdOfBlock')
    }
    nextState.schoolId = id
    this.setState(nextState)
    const body = {
      page: 1,
      size: 1000,
      schoolId: id,
      residenceLevel: 1
    }
    this.fetchData(body)
    this.fetchName(id)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  fetchName = id => {
    let resource = '/school/one'
    const body = {
      id: id
    }
    const cb = json => {
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

  deleteBlock = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    let resource = `/api/residence/delete`
    const body = {
      id: parseInt(id, 10)
    }
    const cb = json => {
      if (json.data) {
        const body = {
          page: 1,
          size: 1000,
          schoolId: this.state.schoolId,
          residenceLevel: 1
        }
        this.fetchData(body)
      } else {
        Noti.hintLock('该楼栋不能被删除！', '请将该楼设备清除后再尝试删除！')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  //this is used to stop the panel expanding
  alertDelete = e => {
    e.stopPropagation()
  }
  changePanel = key => {
    if (key === undefined) {
      return
    }
    let i = key && parseInt(key, 10)
    let { data } = this.state
    if (
      typeof i === 'number' &&
      i >= 0 &&
      !data[i].hasOwnProperty('children')
    ) {
      this.setState({
        fetchingIndex: i
      })
      let residenceId = this.state.data[i].id
      const body = {
        residenceId: residenceId
      }
      this.fetchFloors(body)
    }
  }
  fetchFloors = body => {
    this.setState({
      loading: true
    })
    let resource = '/residence/tree'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error({
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试'
        })
      } else {
        let data = JSON.parse(JSON.stringify(this.state.data))
        let { fetchingIndex } = this.state
        data[fetchingIndex].children = json.data.residences[0].children
        nextState.data = data
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  routeToDetail = (e, id) => {
    e.stopPropagation()
  }
  back = () => {
    this.props.history.goBack()
  }

  render() {
    const { data } = this.state
    const { state } = this.props.location
    const panels = data.map((block, index) => {
      const head = (
        <div key={`header${index}`} className="panelHeader">
          <span>{block.fullName}</span>
          <span className="editLink">
            <Link
              to={'/school/list/blockManage/edit/:' + block.id}
              onClick={e => {
                this.routeToDetail(e, block.id)
              }}
            >
              编辑
            </Link>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此楼么?"
              onClick={this.alertDelete}
              onConfirm={e => {
                this.deleteBlock(e, block.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </span>
        </div>
      )
      const content =
        block.children &&
        block.children.map((floor, ind) => {
          const roomDetail =
            floor.children &&
            floor.children.map((room, i) => {
              let heater =
                room.devices && room.devices.find((r, index) => r.type === 1)
              let water =
                room.devices && room.devices.find((r, index) => r.type === 2)
              return (
                <div
                  key={`divblock${block.id}floor${floor.residence.id}${i}`}
                  className="roomItem"
                >
                  <span
                    key={`spanblock${block.id}floor${floor.residence.id}${i}`}
                  >
                    {room.residence.name}
                  </span>
                  <span>{heater ? heater.macAddress : '暂无'}</span>
                  <span>{water ? water.macAddress : '暂无'}</span>
                </div>
              )
            })
          let n = floor.residence.name
          return (
            <TabPane tab={n} key={ind}>
              <div className="roomTable">
                <div key={`div${ind}`} className="roomItem roomHeader">
                  <span key={`room${ind}`}>宿舍号/位置</span>
                  <span key={`heater${ind}`}>热水器编号</span>
                  <span key={`water${ind}`}>饮水机编号</span>
                </div>
                <div className="roomList">{roomDetail}</div>
              </div>
            </TabPane>
          )
        })
      return (
        <Panel header={head} key={`${index}`}>
          {block.children ? (
            <Tabs tabPosition="left">{content}</Tabs>
          ) : (
            <div className="floorLoading">加载中...</div>
          )}
        </Panel>
      )
    })

    return (
      <div className="blockManage contentArea">
        <div className="nameHeader">
          <div className="schoolName">
            当前管理的学校：{this.state.schoolName}
          </div>
          <div>
            <Link to="/school/list/blockManage/add">
              <Button type="primary">添加楼栋</Button>
            </Link>
          </div>
        </div>
        <Collapse accordion onChange={this.changePanel}>
          {panels}
        </Collapse>
        {state ? (
          <div className="btnRight">
            <Button onClick={this.back}>{BACKTITLE[state.path]}</Button>
          </div>
        ) : null}
      </div>
    )
  }
}

export default BlockManage
