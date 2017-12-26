import React from 'react'
import {Table, Button, Modal} from 'antd'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class SchoolMultiSelectModal extends React.Component{
  static propTypes = {
    schools: PropTypes.array.isRequired
  }
  constructor(props){
    super(props)
    let searchingText = ''
    let {schools, selectedSchools, all} = this.props
    console.log(schools)
    if (all) {
      schools.forEach((r) => {
        r.selected = true
      })
    } else {
      selectedSchools.forEach((r) => {
        let school = schools.find((rec) => (rec.id === parseInt(r.id, 10)))
        school.selected = true
      })
    }
    
    this.state = {
      dataSource: schools,
      searchingText,
      all: all
    }
  }

  componentDidMount(){
    console.log(this.props.schools)
  }
  componentWillReceiveProps (nextProps) {
    console.log(nextProps.schools)
    let nextSchools = JSON.parse(JSON.stringify(nextProps.selectedSchools))
    let all = nextProps.all
    let dataSource = JSON.parse(JSON.stringify(nextProps.schools))
    if (all) {
      dataSource.forEach((r) => (r.selected = true))
      return this.setState({
        dataSource: dataSource,
        all: all
      })
    }
    dataSource.forEach((r) => (r.selected = false))
    nextSchools.forEach((r) => {
      let s = dataSource.find((school) => (school.id === r.id))
      if (s) {
        s.selected = true
      }
    })
    this.setState({
      dataSource: dataSource
    })
  }
  confirm = () => {
    let {all, dataSource} = this.state
    this.props.setSchools({
      all: all,
      dataSource: dataSource
    })
  }
  cancel = () => {
    //clear all the data
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach((r) => (r.selected = false))
    this.setState({
      dataSource: dataSource
    })
    this.props.closeModal()
  }
  changeSelect = (e,i) => {
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource[i].selected = !dataSource[i].selected
    let nextState = {
      dataSource: dataSource
    }
    if (this.state.all) {
      // if 'all', must be false after change
      nextState.all = false
    } else {
      let all = dataSource.every((r) => (r.selected === true))
      if (all) {
        nextState.all = true
      }
    }
    this.setState(nextState)
  }
  searchKey = (e) => {
    if(e.key.toLowerCase() === 'enter'){
      this.handleSearch()
    }
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value.trim()
    })
  }
  handleSearch = () => {
    let schools = JSON.parse(JSON.stringify(this.props.schools))
    let result = schools.filter((r) => (r.name.includes(this.state.searchingText)))
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach((r) => {
      if (r.selected) {
        let school = result.find(rec => r.id === rec.id)
        if (school) {
          school.selected = true
        } 
      }
    })
    let all = result.every(r => r.selected === true)
    this.setState({
      dataSource: result,
      all: all
    })
  }
  resetSearch = () => {
    let data = JSON.parse(JSON.stringify(this.props.schools))
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach((r) => {
      if (r.selected) {
        let school = data.find((rec) => (rec.id === r.id))
        // schools should always be real
        if (school) {
          school.selected = true
        }
      }
    })
    let all = data.every(r => r.selected === true)
    this.setState({
      searchingText: '',
      dataSource: data,
      all: all
    })
  }
  selectRow = (record, index, event) => {
    this.changeSelect(null, index)
  }
  toggleAll = () => {
    let all = !this.state.all
    const nextState = {
      all: all
    }
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource)) 
    // status of 'all' will be updated to 'false' when changes be made under 'all === true'
    // thus if 'all' is true and clicked the button, clear all the selected items
    if (all) {
      dataSource.forEach((r) => (r.selected = true))
      nextState.dataSource = dataSource
    } else {
      dataSource.forEach((r) => (r.selected = false))
      nextState.dataSource = dataSource
    }
    this.setState(nextState)
  }
  render(){
    const {dataSource, all, searchingText} = this.state
    const {showModal} = this.props

    const columns = [{
      title: (<p >学校名称</p>),
      dataIndex: 'name'
    }, {
      title: (<p style={{textAlign:'center'}}>操作</p>),
      dataIndex: 'selected',
      width: '100px',
      className: 'center',
      render: (text, record, index) => (
        <input type='checkbox' checked={record.selected} onChange={(e)=>{this.changeSelect(e,index)}} />
      )
    }]

    const schools = dataSource && dataSource.filter((r,i)=>(r.selected === true))

    const selectedSchoolItems = schools && schools.map((r,i)=>(
      <span className='seperateItem' key={i} >{r.name}/</span>
    ))

    return (
      <Modal wrapClassName='modal' 
        width={800} 
        title='' 
        visible={showModal} 
        onCancel={this.cancel} 
        onOk={this.confirm} 
        okText='' 
        footer={null}
      >
        <div className='giftStatus searchLine maintainerSchSel'>
          <input 
            placeholder="搜索学校" 
            className='searchInput' 
            value={searchingText} 
            onKeyDown={this.searchKey} 
            onChange={this.changeSearch} 
          />
          <div>
            <Button 
              className='mgr10' 
              type='primary' 
              onClick={this.toggleAll} 
            >
              {all ? '取消' : '全选'}
            </Button>
            <Button className='rightConfirm' type='primary' onClick={this.confirm} >确定</Button>
          </div>
        </div>
        <div className='depositGiftTable'>
          <p style={{marginBottom:'10px'}}>当前已选择的学校:{selectedSchoolItems}</p>
          <Table 
            rowKey={record=>record.id}  
            pagination={false} 
            dataSource={dataSource} columns={columns} 
            onRowClick={this.selectRow} 
          />
        </div>
        
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schools: state.setSchoolList.schools
})

export default connect(mapStateToProps, {
})(SchoolMultiSelectModal)
