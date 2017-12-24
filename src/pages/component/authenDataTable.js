import React from 'react'
import {Link} from 'react-router-dom'
import {Collapse} from 'antd'
import {mul} from '../util/numberHandle'
const Panel = Collapse.Panel
const ITEMHEIGHT = 40
const getModelNode = (status, keys) => {
  if (keys.length === 0) {
    return status[0]
  }
  let i = 0, model = status[keys[i++] - 1], temp
  while (i < keys.length && model.children) {
    temp = model.children[keys[i++] - 1]
    model = temp
  }
  return model
}
const setStatusForChildren = (model) => {
  model.children.forEach((r) => {
    r.selected = model.selected
    if (r.children) {
      r.children = setStatusForChildren(r)
    }
  })
  return model.children
}
export default class AuthenDataTable extends React.Component{
  constructor(props){
    super(props)
    let authenData = JSON.parse(JSON.stringify(props.authenStatus))
    this.state = {
      authenStatus: authenData
    }
  }

  getHeight = (count) => {
    let c = count ? count : 1
    return mul(c, ITEMHEIGHT)
  }
  setAuthen = (e, rootIndex) => {
    let {clickable} = this.props
    if (!clickable) {
      return
    }
    let authenStatus = JSON.parse(JSON.stringify(this.props.authenStatus))
    let node = e.target
    let level = parseInt(node.getAttribute('data-level'), 10), key = node.getAttribute('data-key')
    if (!key) {
      return
    }
    let keys = key.split('-').map(r => parseInt(r, 10))
    let model = getModelNode(authenStatus, keys)
    model.selected = model.selected ? false : true
    if (model.children) {
      model.children = setStatusForChildren(model)
    }
    level--
    while (level > 0) {
      keys.pop()
      model = getModelNode(authenStatus, keys)
      if (model && model.children) {
        let noneSelected = model.children.every(r => r.selected === false)
        if (noneSelected) {
          model.selected = false
        } else {
          model.selected = true
        }
      }
      level--
    }
    this.props.setStatus(authenStatus)
  }
  delete = (e, id) => {
    e.preventDefault()
    if (this.props.delete) {
      this.props.delete(id)
    }
  }
  render(){
    const {authenStatus, edit} = this.props
    console.log(authenStatus)

    const authenPanel = authenStatus && authenStatus.map((r, i) => {
      let level2 = r.children && r.children.map((rec, ind) => {
        let level3 = rec.children && rec.children.map((record, index) => {
          let level4 = record.children && record.children.map((item, x) => {
            return (
              <div key={`panel${i}level4${item.key}`} className='levelContent' >
                <div 
                  key={item.key} 
                  data-level={4} 
                  data-key={item.key}  
                  className={item.selected ? 'selected levelHeader level4Header' : 'levelHeader level4Header'}
                >
                  {item.name}
                </div>
                <div key={`select${item.key}`} data-level={4} data-key={item.key} className='selectBox'>
                  {
                    edit ? 
                    (<span className='editBox'>
                      <Link to={`/employee/authen/detail/:${item.id}`}>编辑</Link>
                      <span className='ant-divider' />
                      <a href='' onClick={(e) => {this.delete(e, item.id)}}>删除</a>
                    </span>)
                    : 
                    (item.selected ? '√' : '')
                  }
                </div>
              </div>
            )
          })
          return (
            <div key={`panel${i}level3${record.key}`} className='levelContent' >
              <div 
                key={record.key} 
                data-level={3} 
                data-key={record.key}  
                className={record.selected ? 'selected levelHeader level3Header' : 'levelHeader level3Header'}
                style={{height: this.getHeight(record.count)}} 
              >
                {record.name}
              </div>
              <div key={`panel${i}level3${record.key}children}`} className='levelChilrenWrapper'>
                {level4}
              </div>
            </div>
          )
        })
        return (
          <div key={`panel${i}level2${rec.key}`} className='levelContent'>
            <div 
              key={rec.key} 
              data-level={2} 
              data-key={rec.key}  
              className={rec.selected ? 'selected levelHeader level2Header' : 'levelHeader level2Header'}
              style={{height: this.getHeight(rec.count)}}
            >
              {rec.name}
            </div>
            <div key={`panel${i}level2${rec.key}children`} className='levelChildrenWrapper'>
              {level3}
            </div>
          </div>
        )
      })
      return (
        <Panel header={r.name} key={`panel${i}`}>
          <div className='levelContent panelWrapper' key={`panel${i}tab`} onClick={(e) => {this.setAuthen(e, i)}}>
            <div 
              key={`panel${i}${r.key}`} 
              data-level={1} 
              data-key={r.key} 
              className={r.selected ? 'levelHeader level1Header selected' : 'levelHeader level1Header'}
              style={{height: this.getHeight(r.count) + 1}}
            >
              {r.name}
            </div>
            <div key={`panel${i}children`} className='levelChildrenWrapper level1ChildrenWrapper'>
              {level2}
            </div>
          </div>
        </Panel>
      ) 
    })

    return (
      <Collapse accordion onChange={this.changePanel} className='roleTable' >
        {authenPanel}
      </Collapse>
    )
  }
}
