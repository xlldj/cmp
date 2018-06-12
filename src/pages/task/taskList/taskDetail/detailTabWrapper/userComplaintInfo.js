import React, { Component, Fragment } from 'react'
import { Table, Carousel, Modal } from 'antd'
import Time from '../../../../../util/time'
import CONSTANTS from '../../../../../constants'
import AjaxHandler from '../../../../../util/ajax'
import { connect } from 'react-redux'
import { checkObject } from '../../../../../util/checkSame'
import { changeTask } from '../../../../../actions'
const { TASK_DETAIL_LIST_LENGTH: SIZE, TASK_TYPE_COMPLAINT } = CONSTANTS

class UserComplaintInfo extends Component {
  state = {
    list: [],
    loading: false,
    index: -1,
    initialSlide: 0,
    showTabImg: false
  }
  userComplaintsColumns = [
    {
      title: '投诉类型',
      dataIndex: 'orderType',
      width: '15%',
      render: (text, record) => CONSTANTS.COMPLAINTTYPES[record.orderType]
    },
    {
      title: '投诉内容',
      dataIndex: 'description',
      width: '35%'
    },
    {
      title: '报修图片',
      dataIndex: 'images',
      width: '30%',
      render: (text, record, index) => {
        let imagelis =
          record.images &&
          record.images.map((r, i) => (
            <li className="thumbnail" key={i}>
              <img
                src={CONSTANTS.FILEADDR + r}
                alt=""
                onClick={() => {
                  this.showTabImg(index, i)
                }}
                onLoad={e => this.setWH(e, 30)}
              />
            </li>
          ))
        return <ul className="thumbnailWrapper">{imagelis}</ul>
      }
    },
    {
      title: '投诉时间',
      dataIndex: 'createTime',
      width: '20%',
      render: (text, record) => Time.getTimeStr(record.createTime)
    }
  ]
  setWH = (e, value) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = value ? `${value}px` : '50px'
    } else {
      img.style.height = value ? `${value}px` : '50px'
    }
  }
  showTabImg = (index, i) => {
    this.setState({
      index,
      initialSlide: i,
      showTabImg: true
    })
  }
  closeTabImgs = () => {
    this.setState({
      initialSlide: 0,
      showTabImg: false
    })
  }
  componentDidMount() {
    this.fetchData(this.props)
  }
  componentWillReceiveProps(nextProps) {
    if (!checkObject(this.props, nextProps, ['creatorId', 'page'])) {
      this.fetchData(nextProps)
    }
  }
  fetchData(props) {
    const { loading } = this.state
    const { page } = props
    if (loading) {
      return
    }
    this.setState({
      loading: true
    })
    const { creatorId } = this.props
    const body = {
      creatorId,
      page,
      size: SIZE,
      type: TASK_TYPE_COMPLAINT
    }
    const resource = '/api/work/order/list'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        this.setState({
          list: json.data.workOrders,
          loading: false
        })
        this.props.changeTask('taskDetail', {
          complaintTotal: json.data.total || 0
        })
      }
    })
  }
  render() {
    const { list, loading, index, initialSlide, showTabImg } = this.state
    const images = list && list[index] && list[index].images
    const tabCarouselItems =
      images &&
      images.length > 0 &&
      images.map((r, i) => {
        return (
          <img
            alt=""
            key={i}
            src={CONSTANTS.FILEADDR + r}
            className="carouselImg"
          />
        )
      })
    const tabCarousel = (
      <Carousel
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={false}
        arrows={true}
        initialSlide={initialSlide}
      >
        {tabCarouselItems}
      </Carousel>
    )
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey={record => record.id}
          pagination={false}
          dataSource={list}
          columns={this.userComplaintsColumns}
        />
        <Modal
          visible={showTabImg}
          title=""
          closable={true}
          onCancel={this.closeTabImgs}
          className="carouselModal"
          okText=""
          footer={null}
        >
          <div className="carouselContainer">
            {showTabImg ? tabCarousel : null}
          </div>
        </Modal>
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  page: state.taskModule.taskDetail.complaintPage
})
export default connect(mapStateToProps, { changeTask })(UserComplaintInfo)
