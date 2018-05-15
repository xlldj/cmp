import React, { Fragment } from 'react'
import { Popconfirm, Button, Modal, Carousel } from 'antd'
import PopConfirmSelect from '../../../../pages/component/popConfirmSelect'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { defriend, deleteComment } from '../controller'
const {
  LOST_FOUND_STATUS_SHADOWED,
  LOSTTYPE,
  LOST_BLACK_TIME_SELECTOPTIONS,
  LOST_BLACK_TIME_SELECTED
} = CONSTANTS
class LostContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loseBlackTime: LOST_BLACK_TIME_SELECTED,
      showDetailImgs: false,
      initialSlide: 0
    }
  }
  showDetailImgModel = i => {
    this.setState({
      initialSlide: i,
      showDetailImgs: true
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
  getImgsContent = () => {
    const { data } = this.props
    const { images } = data
    let imagesContent =
      images &&
      images.map((image, index) => {
        return (
          <img
            src={image}
            key={`image${index}`}
            alt=""
            onClick={() => {
              this.showDetailImgModel(index)
            }}
            onLoad={e => this.setWH(e, 30)}
          />
        )
      })
    return imagesContent
  }
  defriend = () => {
    const { data } = this.props
    const { userId, id } = data
    const { loseBlackTime } = this.state
    const level = loseBlackTime
    defriend(userId, id, level, id)
  }
  changeOpt = v => {
    this.setState({
      loseBlackTime: v
    })
  }
  deleteComment = () => {
    const { data } = this.props
    const { type, id } = data
    deleteComment(id, type, id)
  }
  blackUser = () => {}
  goToUserInfo = userId => {
    this.props.history.push({
      pathname: `/user/userInfo/:${userId}`
    })
  }
  render() {
    const { data, forbiddenStatus } = this.props
    console.log(data)
    const { showDetailImgs, initialSlide } = this.state
    const {
      title,
      user,
      mobile,
      userInBlackList,
      type,
      createTime,
      description,
      commentsCount,
      viewCount,
      userId,
      images
    } = data
    let imagesContent = this.getImgsContent()
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
    const { loseBlackTime } = this.state
    return (
      <Fragment>
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${title || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>发布用户:</label>
            <span>
              <Link className="softLink" to={`/user/userInfo/:${userId}`}>
                {mobile}
                {userInBlackList ? '(已拉黑)' : ''}
              </Link>
            </span>
          </li>
          <li>
            <label>用户昵称:</label>
            <span>{user}</span>
          </li>
          <li>
            <label>发布类型:</label>
            <span>
              {type ? (LOSTTYPE[type] ? LOSTTYPE[type] : '暂无') : '暂无'}
            </span>
          </li>
          <li>
            <label>发布时间:</label>
            <span>{createTime ? Time.getTimeStr(createTime) : '--'}</span>
          </li>
          {images && images.length ? (
            <li>
              <label>发布图片:</label>
              <span>{imagesContent}</span>
            </li>
          ) : null}

          <li>
            <label>发布内容:</label>
            <span>{description ? description : '--'}</span>
          </li>
          <li>
            <label>评论数量:</label>
            <span>{commentsCount || ''}</span>
          </li>
          <li>
            <label>查看数量:</label>
            <span>{viewCount || ''}</span>
          </li>
        </ul>
        {data.status !== LOST_FOUND_STATUS_SHADOWED &&
        !forbiddenStatus.SHIELD_LOST_INFO ? (
          <Popconfirm
            title="确认屏蔽此条失物招领?"
            onConfirm={this.deleteComment}
          >
            <Button type="primary" className="rightSeperator">
              屏蔽此条失物招领
            </Button>
          </Popconfirm>
        ) : null}
        {userInBlackList || forbiddenStatus.DEACTIVE_USER ? null : (
          <PopConfirmSelect
            confirmOk={this.defriend}
            selectOptions={LOST_BLACK_TIME_SELECTOPTIONS}
            selectedId={loseBlackTime}
            changeOpt={this.changeOpt}
            allTitle="选择拉黑时常"
            contentConfirm={
              <Button type="primary" className="rightSeperator">
                拉黑该发布用户
              </Button>
            }
          />
        )}
        {/* images in task detail */}
        <Modal
          visible={showDetailImgs}
          title=""
          closable={true}
          onCancel={this.closeDetailImgs}
          className="carouselModal"
          okText=""
          footer={null}
        >
          <div className="carouselContainer">
            {showDetailImgs ? carousel : null}
          </div>
        </Modal>
      </Fragment>
    )
  }
}
export default withRouter(LostContent)
