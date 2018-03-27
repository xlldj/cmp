import React from 'react'
import { Button, Modal, Carousel, Popconfirm } from 'antd'
import AjaxHandler from '../../util/ajax'
import Time from '../../util/time'
import CONSTANTS from '../../constants'
import Noti from '../../util/noti'
import BasicSelector from '../component/basicSelectorWithoutAll'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setAuthenData } from '../../actions'

const typeName = {
  1: '失物',
  2: '招领'
}

class LostInfo extends React.Component {
  static propTypes = {
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      showImgs: false,
      initialSlide: 0,
      showDefriendDate: false,
      defriendError: false,
      defriending: false,
      blocking: false
    }
  }
  fetchData = body => {
    let resource = '/api/lost/details'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.setState({
            data: json.data
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    let id = this.props.match.params.id.slice(1)
    const body = {
      id: id
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.push('/lost')
  }
  showImgs = (e, i) => {
    this.setState({
      showImgs: true,
      initialSlide: i
    })
  }
  closeImgs = () => {
    this.setState({
      showImgs: false
    })
  }
  blockMessage = () => {
    if (this.state.blocking) {
      return
    }
    this.setState({
      blocking: true
    })
    let resource = '/lost/delete'
    const body = {
      id: this.state.data.id
    }
    const cb = json => {
      this.setState({
        blocking: false
      })
      if (json.data) {
        if (json.data.result) {
          Noti.hintSuccess(this.props.history, '/lost')
        } else if (json.data.failReason) {
          Noti.hintLock('操作失败', json.data.failReason)
        }
      } else {
        Noti.hintServiceError(json.error ? json.error.displayMessage : '')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  defriend = () => {
    this.setState({
      showDefriendDate: true
    })
  }
  changeLevel = v => {
    this.setState({
      defriendLevel: v
    })
  }
  postLevel = () => {
    let { defriendLevel, data, defriending } = this.state
    if (defriending) {
      return
    }
    if (!defriendLevel) {
      return this.setState({
        defriendError: true
      })
    }

    this.setState({
      defriending: true
    })
    let resource = '/lost/defriend'
    const body = {
      id: data.id,
      userId: data.userId,
      level: parseInt(defriendLevel, 10)
    }
    const cb = json => {
      const nextState = {
        defriending: false
      }
      if (json.data) {
        if (json.data.result) {
          Noti.hintOk('操作成功', '该用户已被拉入黑名单')
          nextState.showDefriendDate = false
          nextState.level = ''
        } else {
          Noti.hintWaring(
            '操作失败',
            json.data.failReason || '请求出错,请联系客服或相关人员'
          )
        }
      } else {
        Noti.hintServiceError(json.error ? json.error.displayMessage : '')
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  cancelDefriend = () => {
    this.setState({
      defriendLevel: '',
      showDefriendDate: false
    })
  }
  render() {
    let {
      data,
      showImgs,
      initialSlide,
      showDefriendDate,
      defriendLevel,
      defriendError,
      blocking
    } = this.state
    const { forbiddenStatus } = this.props

    let createTimeStr = Time.getTimeStr(data.createTime),
      lostStr = Time.getTimeStr(data.lostTime)

    const imgs =
      data.images &&
      data.images.length > 0 &&
      data.images.map((s, i) => (
        <img
          alt=""
          key={s}
          src={CONSTANTS.FILEADDR + s}
          className="thumbnail"
          onClick={e => {
            this.showImgs(e, i)
          }}
        />
      ))

    const carouselItems =
      data.images &&
      data.images.length > 0 &&
      data.images.map((r, i) => {
        return (
          <img
            alt=""
            key={r}
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
        autoplay={data.images && data.images.length > 1 ? true : false}
        arrows={true}
        initialSlide={initialSlide}
      >
        {carouselItems}
      </Carousel>
    )

    return (
      <div className="infoList lostInfo">
        <ul>
          <li>
            <p>学校:</p>
            {data.schoolName}
          </li>
          <li>
            <p>用户:</p>
            {data.user}
            {forbiddenStatus.DEACTIVE_USER ? null : (
              <div className="defriendWrapper">
                <Popconfirm
                  title="确定要拉入黑名单么?"
                  onConfirm={this.defriend}
                  okText="确认"
                  cancelText="取消"
                >
                  <a href="">拉入黑名单</a>
                </Popconfirm>
                {showDefriendDate ? (
                  <span className="selectWrapper">
                    <BasicSelector
                      width={CONSTANTS.SHORTSELECTOR}
                      staticOpts={CONSTANTS.DEFRIENDLEVEL}
                      selectedOpt={defriendLevel}
                      changeOpt={this.changeLevel}
                      invalidTitle="选择时长"
                    />
                    <Button type="primary" onClick={this.postLevel}>
                      确认
                    </Button>
                    <Button onClick={this.cancelDefriend}>取消</Button>
                    {defriendError ? (
                      <span className="checkInvalid">
                        请先选择拉入黑名单的期限!
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            )}
          </li>
          <li>
            <p>类型:</p>
            {typeName[data.type]}
          </li>
          {data.images && data.images.length > 0 ? (
            <li className="imgWrapper">
              <p>图片:</p>
              {imgs}
            </li>
          ) : null}
          <li>
            <p>标题:</p>
            {data.title}
          </li>
          <li className="itemsWrapper">
            <p>过程描述:</p>
            <div className="paragraph">{data.description}</div>
          </li>
          <li>
            <p>物品名称:</p>
            {data.itemName}
          </li>
          <li>
            <p>地点:</p>
            {data.location}
          </li>
          <li>
            <p>时间:</p>
            {lostStr}
          </li>
          <li>
            <p>联系方式:</p>
            {data.mobile}
          </li>
          <li>
            <p>发布时间:</p>
            {createTimeStr}
          </li>
        </ul>
        <div className="btnArea">
          {forbiddenStatus.SHIELD_LOST_INFO ? null : blocking ? (
            <Button type="primary">屏蔽显示</Button>
          ) : (
            <Popconfirm
              title="确定要屏蔽显示么?"
              onConfirm={this.blockMessage}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">屏蔽显示</Button>
            </Popconfirm>
          )}
          <Button onClick={this.back}>返回</Button>
        </div>

        {showImgs ? (
          <Modal
            visible={true}
            title=""
            closable={false}
            onCancel={this.closeImgs}
            className="carouselModal"
            okText=""
            footer={null}
          >
            <div className="carouselContainer">{carousel}</div>
          </Modal>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

export default withRouter(
  connect(mapStateToProps, {
    setAuthenData
  })(LostInfo)
)
