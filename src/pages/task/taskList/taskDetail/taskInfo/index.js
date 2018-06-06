import React, { Component, Fragment } from 'react'
import { Modal, Carousel } from 'antd'
import DeviceRepairInfo from './deviceRepairInfo'
import OrderComplaintInfo from './orderComplaintInfo'
import OrderwarnInfo from './orderwarnInfo'
import FeedbackInfo from './FeedbackInfo'

import CONSTANTS from '../../../../../constants'
const { TASKTYPE } = CONSTANTS

class TaskInfoWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showTaskInfoCarousel: false,
      initialSlide: 0
    }
  }
  closeDetailImgs = () => {
    this.setState({
      showTaskInfoCarousel: false
    })
  }
  showDetailImgModel = i => {
    this.setState({
      initialSlide: i,
      showTaskInfoCarousel: true
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
    const { showTaskInfoCarousel, initialSlide } = this.state
    const { data } = this.props
    const { type, schoolName, images } = data
    const carouselItems =
      images &&
      images.map((r, i) => {
        return (
          <img
            key={`carousel${i}`}
            alt=""
            src={CONSTANTS.FILEADDR + r}
            className="carouselImg"
          />
        )
      })
    const carousel = (
      <Carousel
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={false}
        arrows={true}
        initialSlide={initialSlide}
      >
        {carouselItems}
      </Carousel>
    )
    return (
      <Fragment>
        <h3 className="detailPanel-content-title">
          {type ? TASKTYPE[type] : ''} {schoolName ? schoolName : ''}
        </h3>
        {type === 1 ? (
          <DeviceRepairInfo
            {...data}
            setWH={this.setWH}
            showDetailImgModel={this.showDetailImgModel}
          />
        ) : null}
        {type === 2 ? (
          <OrderComplaintInfo
            {...data}
            setWH={this.setWH}
            showDetailImgModel={this.showDetailImgModel}
          />
        ) : null}
        {type === 3 ? (
          <FeedbackInfo
            {...data}
            setWH={this.setWH}
            showDetailImgModel={this.showDetailImgModel}
          />
        ) : null}
        {type === 4 ? (
          <OrderwarnInfo
            {...data}
            setWH={this.setWH}
            showDetailImgModel={this.showDetailImgModel}
          />
        ) : null}
        {showTaskInfoCarousel ? (
          <Modal
            visible={true}
            title=""
            closable={true}
            onCancel={this.closeDetailImgs}
            className="carouselModal"
            okText=""
            footer={null}
          >
            <div className="carouselContainer">{carousel}</div>
          </Modal>
        ) : null}
      </Fragment>
    )
  }
}

export default TaskInfoWrapper
