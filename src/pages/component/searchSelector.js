import React from 'react'
import {Select} from 'antd'
import AjaxHandler from '../ajax'
const {Option, OptGroup}  = Select

class SchoolSelector extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      schools: []
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
            this.setState({
              schools: json.data.schools
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  } 
  changeSchool = (v) => {
    this.props.changeSchool(v)
  }
  checkSchool = (v) => {
    if (this.props.checkSchool) {
      this.props.checkSchool(v)
    }
  }
  render(){
    const {schools} = this.state
    const schNameOptions = schools.map((s,i) => (
      <Option value={s.id.toString()} key={s.id}>{s.name}</Option>
    ))
    return (
      <Select 
        showSearch
        disabled={this.props.disabled?true:false}
        value={this.props.selectedSchool}
        style={{ width: this.props.width || 105 }} 
        onChange={this.changeSchool} 
        onBlur={this.checkSchool} 
      >
        <Option value='all'>全部学校</Option>
        <OptGroup label="最近选择">
          <Option value="1">浙江大学</Option>
          <Option value="2">杭州电子科技大学</Option>
        </OptGroup>
        {schNameOptions}
      </Select>
    )
  }
}

export default SchoolSelector