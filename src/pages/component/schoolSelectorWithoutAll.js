import React from 'react'
import AjaxHandler from '../ajax'
import {getStore, getLocal, setLocal} from '../util/storage'
import CONSTANTS from './constants'
import Select from './select'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setSchoolList } from '../../actions'

const {Option, OptGroup} = Select

class SchoolSelector extends React.Component{
  static propTypes = {
    recent: PropTypes.array.isRequired,
    schools: PropTypes.array.isRequired,
    schoolSet: PropTypes.bool.isRequired
  }
  componentDidMount(){
    // this.fetchSchools()
    let {schoolSet} = this.props
    if (!schoolSet) {
      this.fetchSchools()
    }
  }
  fetchSchools = () => {
    let resource='/school/list'
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
          /* 
          let nextState = {}
          nextState.schools = json.data.schools
          */
          let recentSchools = getLocal('recentSchools'), recent = []
          if (recentSchools) {
            // let recent = recentSchools.split(',')
            recent = recentSchools.split(',').filter((r) => {
              return json.data.schools.some((s) => (s.id === parseInt(r, 10)))
            })
            // nextState.recent = recent
          }
          // this.setState(nextState)
          this.props.setSchoolList({schoolSet: true, recent: recent, schools: json.data.schools})
        }else{
          throw new Error('网络出错，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  setRecentSchools = () => {
    let {schools, recent} = this.props
    let recentItems = recent.map((r, i) => {
      let item = schools.find(s=>s.id===parseInt(r, 10))
      return (
        <Option value={r.toString()} key={`recent-${r}`}>{(item && item.name) ? item.name : ''}</Option>
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
      name = this.props.schools.find(r=>r.id===parseInt(v, 10)).name
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
      this.props.setSchoolList({recent: recentArr})
      /*
      this.setState({
        recent: recentArr
      })
      */
    }
    this.props.changeSchool(v, name)
  }
  checkSchool = (v) => {
    if (this.props.checkSchool) {
      this.props.checkSchool(v)
    }
  }
  render(){
    const {schools, recent} = this.props

    const schNameOptions = schools.map((s,i) => (
      <Option value={s.id.toString()} key={s.id}>{s.name}</Option>
    ))

    const recentItems = this.setRecentSchools()
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

// export default SchoolSelector

const mapStateToProps = (state, ownProps) => {
  return {
    schools: state.setSchoolList.schools,
    schoolSet: state.setSchoolList.schoolSet,
    recent: state.setSchoolList.recent
  }
}

export default withRouter(connect(mapStateToProps, {
  setSchoolList 
})(SchoolSelector))