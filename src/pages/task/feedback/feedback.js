import React from 'react'
import {Link} from 'react-router-dom'

import {Table, Modal, Carousel} from 'antd'

import Time from '../../component/time'
import AjaxHandler from '../../ajax'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelector'
import SearchLine from '../../component/searchLine'
import {checkObject} from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask } from '../../../actions'

const whr = window.screen.height / window.screen.width
const SIZE = CONSTANTS.PAGINATION
//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))


const subModule = 'feedback'


class Feedback extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    schoolId: PropTypes.string.isRequired
  }
  constructor (props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      showImgs: false,
      editing: 0,
      initialSlide: 0,
      messageVisible: false,
      message: '',
      messageEmpty: false,
      orderId: 0,
      loading: false,
      total: 0
    }
    this.columns = [{
      title: '学校',
      className: 'firstCol',
      dataIndex: 'schoolName',
      width: '16%'
    }, {
      title: '反馈用户',
      dataIndex: 'mobile',
      width: '15%',
      render: (text, record) => (
        <Link className='outLink' to={{pathname:`/user/userInfo/:${record.userId}`,state:{path: 'fromFeedback'}}} >{text}</Link>
      )
    },{
      title: '反馈类型',
      dataIndex: 'option',
      width: '17%',
      render: (text,record)=>(CONSTANTS.FEEDBACKTYPES[record.option])
    },{
      title: '反馈内容',
      dataIndex: 'content',
      width: '17%'
    },{
      title: '反馈图片',
      dataIndex: 'images',
      width: '15%',
      render: (text, record, index) => {
        let imagelis = record.images&&record.images.map((r, i) => (
          <li className='thumbnail' key={i} >
            <img src={CONSTANTS.FILEADDR + r} alt='' onClick={() => {this.showModel(index, i)}} onLoad={this.setWH} />
          </li>
        ))
        return (
          <ul className='thumbnailWrapper'>
            {imagelis}
          </ul>
        )
      }
    },{
      title: '反馈时间',
      dataIndex: 'createTime',
      render: (text, record) => (record.createTime ? Time.getTimeStr(record.createTime) : '暂无')
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/feedback/list'
    const cb = (json) => {
      let nextState = {
        loading: false
      }
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        /*--------redirect --------*/
        if(json.data){
          nextState.dataSource = json.data.feedbacks
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    this.props.hide(false)
    let {page, schoolId} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'schoolId'])) {
      return
    }
    let {page, schoolId} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
  }
  setWH = (e) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = '100%'
    } else {
      img.style.height = '100%'
    }
  }
  loadImgDetail = (e) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    let imgWhr = h / w
    if (imgWhr < whr) {
      img.style.width = '100%'
    } else {
      img.style.height = '100%'
    }
  }
  closeImgs = (e) => {
    this.setState({
      showImgs: false
    })
  }
  showModel = (index, i) => {
    this.setState({
      editing: index,
      initialSlide: i,
      showImgs: true
    })
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeTask(subModule, {page: page})
  }
  changeSchool = (v) => {
    let schoolId = this.props.schoolId
    if (v !== schoolId) {
      this.props.changeTask(subModule, {schoolId: v})
    }
  }
  render () {
    let {dataSource, showImgs, editing, initialSlide, total, loading} = this.state
    const {page, schoolId} = this.props

    const carouselItems = (dataSource&&dataSource[editing]&&dataSource[editing].images&&dataSource[editing].images.length>0)&&(dataSource[editing].images.map((r,i) => {
      return <img alt='' key={i} src={CONSTANTS.FILEADDR + r} className='carouselImg' />
    }))

    const carousel = (
      <Carousel dots={true} accessibility={true}  className='carouselItem' autoplay={false} arrows={true} initialSlide={initialSlide} >
        {carouselItems}
      </Carousel>
    )

    return (
      <div className='contentArea'>
        <SearchLine  
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
        />

        <div className='tableList complaint'>
          <Table 
            bordered
            loading={loading}
            rowKey={(record)=>(record.id)} 
            pagination={{pageSize: SIZE, current: page, total: total}}  
            dataSource={dataSource} 
            columns={this.columns} 
            onChange={this.changePage}
          />
        </div>

        <Modal  visible={showImgs}  title='' closable={false} onCancel={this.closeImgs}  className='carouselModal' okText='' footer={null} >
          <div className='carouselContainer' >{ showImgs ? carousel : null}</div>
        </Modal>
      </div>
    )
  }
}

// export default ComplaintTable
const mapStateToProps = (state, ownProps) => ({
  page: state.changeTask[subModule].page,
  schoolId: state.changeTask[subModule].schoolId
})

export default withRouter(connect(mapStateToProps, {
  changeTask
})(Feedback))