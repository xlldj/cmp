import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import AddPlusAbs from '../../component/addPlusAbs'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
class ChargeInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: 0,
      schoolId: 0,
      originalSchool: 0,
      schoolError: false,
      items: [{ value: '' }],
      itemsError: false,
      checking: false,
      posting: false
    }
  }
  fetchData = body => {
    let resource = '/recharge/denomination/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let { id, items, schoolId } = json.data
          let nextState = {
            id: id,
            schoolId: schoolId,
            originalSchool: schoolId
          }
          let result = items.map(r => ({ value: r }))
          nextState.items = result
          this.setState(nextState)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      const body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  postInfo = () => {
    let { id, schoolId, items, posting } = this.state,
      resource
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })

    const body = {
      schoolId: schoolId
    }
    if (id) {
      body.id = id
      resource = '/recharge/denomination/update'
    } else {
      resource = '/recharge/denomination/add'
    }
    body.items = items.map(r => parseInt(r.value, 10))
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/fund/charge')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  confirm = () => {
    let { id, schoolId, originalSchool, checking, posting } = this.state
    const items = JSON.parse(JSON.stringify(this.state.items))
    if (!schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    for (let i = 0; i < items.length; i++) {
      let r = items[i]
      if (!r.hasOwnProperty('value') || !r.value) {
        r.error = true
        r.errorMsg = '面额不能为空'
        return this.setState({
          items: items
        })
      }
      let same = items.some(
        (rec, ind) =>
          parseInt(rec.value, 10) === parseInt(r.value, 10) && ind !== i
      )
      if (same) {
        r.error = true
        r.errorMsg = '面额重复，请勿重复添加'
        return this.setState({
          items: items
        })
      }
    }
    if (checking || posting) {
      return
    }
    if (!(id && originalSchool === schoolId)) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
  }
  back = () => {
    this.props.history.goBack()
  }
  checkExist = callback => {
    if (this.state.checking) {
      return
    }
    this.setState({
      checking: true
    })
    let schoolId = parseInt(this.state.schoolId, 10)
    let resource = '/recharge/denomination/check'
    const body = {
      schoolId: schoolId
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintWarning('添加出错', '当前设备已有预付选项，请返回该项编辑')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeAmount = (e, index) => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    let v = e.target.value
    items[index].value = v
    this.setState({
      items: items
    })
  }
  checkAmount = (e, index) => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    let v = parseInt(e.target.value.trim(), 10)
    items[index].value = v
    if (!v) {
      items[index].error = true
      items[index].error = '面额不能为空'
      return this.setState({
        items: items
      })
    }
    let same = items.some((r, i) => i !== index && parseInt(r.value, 10) === v)
    if (same) {
      items[index].error = true
      items[index].errorMsg = '当前面额已被添加，请勿重复添加～'
      return this.setState({
        items: items
      })
    }
    items[index].error = false
    this.setState({
      items: items
    })
  }
  abstractItem = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.pop()
    this.setState({
      items: items
    })
  }
  addItem = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.push({ value: '' })
    this.setState({
      items: items
    })
  }
  changeSchool = v => {
    this.setState({
      schoolId: parseInt(v, 10)
    })
  }
  checkSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let { schoolError, id, originalSchool, schoolId } = this.state
    if (schoolError) {
      this.setState({
        schoolError: false
      })
    }
    if (!(id && originalSchool === schoolId)) {
      this.checkExist(null)
    }
  }

  render() {
    let { id, items, schoolId, schoolError } = this.state
    let l = items.length
    const itemsGroup =
      items &&
      items.map((record, index) => {
        return (
          <div key={`div${index}`}>
            <span>面额</span>
            <input
              type="number"
              key={`amount${index}`}
              className="shortInput"
              onChange={e => {
                this.changeAmount(e, index)
              }}
              onBlur={e => {
                this.checkAmount(e, index)
              }}
              value={record.value}
            />
            <span>元</span>
            {record.error ? (
              <span className="checkInvalid">
                {record.errorMsg ? record.errorMsg : '金额不能为空！'}
              </span>
            ) : null}
          </div>
        )
      })
    return (
      <div className="infoList prepayInfo">
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              disabled={id}
              width={'140px'}
              className={id ? 'disabled' : ''}
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>
          <li className="itemsWrapper">
            <p>充值面额:</p>
            <div>
              {itemsGroup}
              <AddPlusAbs
                count={l}
                abstract={this.abstractItem}
                add={this.addItem}
              />
            </div>
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.back}>
            {this.props.location.state
              ? BACKTITLE[this.props.location.state.path]
              : '返回'}
          </Button>
        </div>
      </div>
    )
  }
}

export default ChargeInfo
