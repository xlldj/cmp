import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import AddPlusAbs from '../../component/addPlusAbs'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setAuthenData } from '../../../actions'

class AuthenInfo extends React.Component {
  static propTypes = {
    full: PropTypes.array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      main: '',
      mainError: false,
      sub: '',
      subError: false,
      ope: '',
      opeError: false,
      des: '',
      desError: false,
      path: [{name: '', error: false}],
      pathError: false,
      subItems: {}
    }
    const mainNav = {}
    let full = this.props.full
    full.forEach((r) => {
      mainNav[r.id] = r.name
    })
    this.mainNav = mainNav
  }
  fetchData = (body) => {
    let resource='/api/employee/one'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let {id, mobile, type, nickName, schools} = json.data
            this.setState({
              id: id,
              mobile: mobile,
              type: type,
              nickName: nickName,
              schools: schools,
              originalMobile: mobile
            })
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  } 
  componentDidMount () {
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = this.props.match.params.id.slice(1) 
      const body={
        id: parseInt(id, 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  postData = () => {
    const {id, sub, ope, des, path, posting} = this.state
    if (posting) {
      return
    }
    const pathArr = []
    path.forEach((r) => {
      if (r.name) {
        pathArr.push(r.name)
      }
    })
    let resource = '/privilege/add'
    const body = {
      navId: parseInt(sub, 10),
      oper: parseInt(ope, 10),
      desc: des,
      path: pathArr
    }
    if (id) {
      resource = '/privilege/update'
      body.id = id
    }
    const cb = (json) => {
      if (json.data.result) {
        Noti.hintSuccess(this.props.history, '/employee/authen')
      } else {
        Noti.hintWarning('添加出错', json.data.failReason || '请稍后重试')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  confirm = () => {
    const {main, sub, ope, des, path, checking, posting} = this.state
    if (checking || posting) {
      return
    }
    if (!main) {
      return this.setState({
        mainError: true
      })
    }
    if (!sub) {
      return this.setState({
        subError: true
      })
    }
    if (!ope) {
      return this.setState({
        opeError: true
      })
    }
    if (!des) {
      return this.setState({
        desError: true
      })
    }
    path.forEach((r, i) => {
      if (!r.name) {
        path.splice(i, 1)
      }
    })
    if (path.length === 0) {
      return this.setState({
        pathError: true
      })
    }
    this.postData()
  }
  changeMain = (v) => {
    this.setState({
      main: v
    })
    if (v) {
      let block = this.props.full.find(r => r.id === parseInt(v, 10))
      let subItems = {}
      if (block) {
        block.children.forEach((r) => {
          subItems[r.id] = r.name
        })
        this.setState({
          subItems: subItems
        })
      }
    }
  }
  checkMain = (v) => {
    if (!v) {
      this.setState({
        mainError: false
      })
    } else if (this.state.mainError) {
      this.setState({
        mainError: false
      })
    }
  }
  changeSub = (v) => {
    this.setState({
      sub: v
    })
  }
  checkSub = (v) => {
    if (!v) {
      this.setState({
        subError: false
      })
    } else if (this.state.subError) {
      this.setState({
        subError: false
      })
    }
  }
  changeOpe = (v) => {
    this.setState({
      ope: v
    })
  }
  checkOpe = (v) => {
    if (!v) {
      this.setState({
        opeError: true
      })
    } else if (this.state.opeError) {
      this.setState({
        opeError: false
      })
    }
  }
  changeDes = (e) => {
    this.setState({
      des: e.target.value
    })
  }
  checkDes = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        desError: true,
        des: v
      })
    }
    if (this.state.desError) {
      this.setState({
        desError: false,
        des: v
      })
    }
  }
  changePath = (e, i) => {
    let v = e.target.value
    let path = JSON.parse(JSON.stringify(this.state.path))
    path[i].name = v
    this.setState({
      path: path
    })
  }
  checkPath = (e, i) => {
    let v = e.target.value.trim()
    let path = JSON.parse(JSON.stringify(this.state.path))
    if (!v) {
      path[i].error = true
    } else {
      path[i].error = false
    }
    path[i].name = v
    this.setState({
      path: path
    })
  }
  add = () => {
    let path = JSON.parse(JSON.stringify(this.state.path))
    path.push({name: '', error: false})
    this.setState({
      path: path
    })
  }
  abstract = () => {
    let path = JSON.parse(JSON.stringify(this.state.path))
    path.pop()
    this.setState({
      path: path
    })
  }
  
  render () {
    const {id, main, mainError, sub, subError, 
      subItems, ope, opeError, des, desError, 
      path, pathError
    } = this.state
    const pathItems = path && path.map((r, i) => {
      return (
        <div key={`path${i}`}>
          <input value={r.name} onChange={(e) => {this.changePath(e, i)}} onBlur={(e) => {this.checkPath(e, i)}} />
          {r.error ? <span className='checkInvalid'>链接不能为空！</span> : null}
        </div>
      )
    })

    return (
      <div className='infoList'>
        <ul>
          <li>
            <p>主导航:</p>
            <BasicSelector
              invalidTitle=''
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={this.mainNav}
              selectedOpt={main}
              disabled={id}
              className={id ? 'disabled' : ''} 
              changeOpt={this.changeMain} 
              checkMain={this.checkMain} 
            />
            { mainError ? <span className='checkInvalid'>请选择主导航！</span> : null }
          </li>
          <li>
            <p>子导航:</p>
            <BasicSelector
              invalidTitle=''
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={subItems}
              selectedOpt={sub}
              disabled={id}
              className={id ? 'disabled' : ''} 
              changeOpt={this.changeSub} 
              checkMain={this.checkSub} 
            />
            { subError ? <span className='checkInvalid'>请选择子导航！</span> : null }
          </li>   
          <li>
            <p>权限类型:</p>
            <BasicSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={ope}
              changeOpt ={this.changeOpe}
              checkOpt ={this.checkOpe}
              staticOpts={CONSTANTS.AuthenOpeType}
              invalidTitle=''
            />
            { opeError ? <span className='checkInvalid'>请选择类型！</span> : null }
          </li>
          <li>
            <p>权限名称:</p>
            <input value={des} onChange={this.changeDes} onBlur={this.checkDes} />
            {desError ? <span className='checkInvalid'>名称不能为空！</span> : null}
          </li>
          <li className='itemsWrapper'>
            <p>链接:</p>
            <div>
              {pathItems}    
              <AddPlusAbs count={path.length} add={this.add} abstract={this.abstract} /> 
            </div>
            {pathError ? <span className='checkInvalid'>链接不能为空！</span> : null}
          </li>
        </ul>
        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>返回</Button>
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  full: state.setAuthenData.full
})

export default withRouter(connect(mapStateToProps, {
  setAuthenData
})(AuthenInfo))