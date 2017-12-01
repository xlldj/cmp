import React from 'react'
import AjaxHandler from '../ajax'
import {getLocal, setLocal} from '../util/storage'
import CONSTANTS from './constants'
import Select from './select'
const {Option, OptGroup} = Select

class SchoolSelector extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      schools: [],
      recent: []
    }
  }
  componentDidMount(){
    this.fetchSchools()
  }
  fetchSchools = () => {
    let resource='/api/school/list'
    const body={
      page: 1,
      size: 100
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let nextState = {}
            nextState.schools = json.data.schools
            let recentSchools = getLocal('recentSchools')
            if (recentSchools) {
              let recent = recentSchools.split(',')
              nextState.recent = recent
            }
            this.setState(nextState)
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  setRecentSchools = (recent) => {
    let schools = this.state.schools
    let recentItems = recent.map((r, i) => {
      let item = schools.find(s=>s.id===parseInt(r, 10))
      return (
        <Option value={r.toString()} key={`recent-${r}`}>{item ? item.name : ''}</Option>
      )
    })
    return (
      <OptGroup title='最近的选择'>
        {recentItems}
      </OptGroup>
    )
  }
  changeSchool = (v) => {
    /* if v is not 'all', store it in the lcoal */
    let name = ''
    if (v !== 'all') {
      // let name = this.state.schools.find(r=>r.id===parseInt(v)).name
      let recentSchools = getLocal('recentSchools'), recentArr = []
      if (recentSchools) {
        recentArr = recentSchools.split(',')
      }
      let i = -1
      if (recentArr.length) {
        i = recentArr.findIndex(r=>r===v)
      }
      if (i !== -1) {
        recentArr.splice(i, 1)
        recentArr.unshift(v)
      } else if (recentArr.length >= CONSTANTS.RECENTCOUNT) {
        recentArr.pop()
        recentArr.unshift(v)
      } else {
        recentArr.unshift(v)
      }
      let recentStr = recentArr.join(',')
      setLocal('recentSchools', recentStr)
      this.setState({
        recent: recentArr
      })

      name = this.state.schools.find((s) => (s.id === parseInt(v, 10))).name
    }
    this.props.changeSchool(v, name)
  }
  checkSchool = (v) => {
    if (this.props.checkSchool) {
      this.props.checkSchool(v)
    }
  }
  render(){
    const {schools, recent} = this.state
    const schNameOptions = schools.map((s,i) => (
      <Option value={s.id.toString()} key={s.id}>{s.name}</Option>
    ))
    const recentItems = this.setRecentSchools(recent)
    return (
      <Select 
        disabled={this.props.disabled ? this.props.disabled : false}
        width={this.props.width ? this.props.width : ''}
        notFoundTitle='选择学校'
        search
        value={this.props.selectedSchool ? this.props.selectedSchool.toString() : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeSchool} 
        onBlur={this.checkSchool} 
      >
        {recent.length > 0 ? recentItems : null }
        {schNameOptions}
      </Select>
    )
  }
}

export default SchoolSelector