import React, { Component, Fragment } from 'react'
import { Table, Badge, Modal, Carousel } from 'antd'
import detailTabHoc from './detailTabHoc'
import Time from '../../../../../util/time'
import CONSTANTS from '../../../../../constants'
import { connect } from 'react-redux'
import { fetchRepairList } from '../../../../../actions'
const {
  TASK_DETAIL_LIST_LENGTH: SIZE,
  TASK_PENDING,
  TASK_ASSIGNED,
  TASK_ACCEPTED,
  TASK_REFUSED,
  TASK_FINISHED
} = CONSTANTS

class UserRepairInfo extends Component {
  committerRepairColumns = [
    {
      title: '报修设备',
      dataIndex: 'deviceType',
      width: '12%',
      render: (text, record, index) =>
        record.deviceType ? CONSTANTS.DEVICETYPE[record.deviceType] : ''
    },
    {
      title: '报修内容',
      dataIndex: 'description',
      width: '23%'
    },
    {
      title: '报修图片',
      dataIndex: 'images',
      width: '25%',
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
      title: '报修时间',
      dataIndex: 'createTime',
      width: '21%',
      render: (text, record) =>
        record.createTime ? Time.getTimeStr(record.createTime) : ''
    },
    {
      title: '维修状态',
      dataIndex: 'status',
      width: '19%',
      render: (text, record, index) => {
        switch (record.status) {
          case TASK_FINISHED:
            return <Badge status="success" text="维修完成" />
          case TASK_PENDING:
            return <Badge status="warning" text="待处理" />
          case TASK_ASSIGNED:
          case TASK_ACCEPTED:
          case TASK_REFUSED:
            return <Badge status="error" text={'处理中'} />
          default:
            return '已取消'
        }
      }
    }
  ]
  state = {
    index: -1,
    initialSlide: 0,
    showTabImg: false
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
  render() {
    const { showTabImg, index, initialSlide } = this.state
    const { list, loading } = this.props
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
          columns={this.committerRepairColumns}
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
const fetchData = props => {
  const { creatorId } = props
  const body = {
    page: 1,
    size: SIZE,
    all: true,
    creatorId,
    type: CONSTANTS.TASK_TYPE_REPAIR
  }
  fetchRepairList(body)
}

const mapStateToProps = (state, ownProps) => ({
  list: state.repairListModal.list,
  loading: state.repairListModal.loading
})
export default connect(mapStateToProps, null)(
  detailTabHoc(UserRepairInfo, fetchData, ['creatorId'])
)
