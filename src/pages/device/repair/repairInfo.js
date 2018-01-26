import React from 'react'
import AjaxHandler from '../../../util/ajax'
import { Button, Modal, Carousel } from 'antd'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import Noti from '../../../util/noti'
const typeName = CONSTANTS.DEVICETYPE
const { TASK_PENDING, TASK_FINISHED, TASKSTATUS } = CONSTANTS
const BACKTITLE = {
  fromTask: '返回客服工单',
  fromDevice: '返回设备详情',
  fromRepairLog: '返回用户报修记录'
}

class RepairInfo extends React.Component {
  constructor(props) {
    super(props)
    let data = {
      device: {
        schoolName: '',
        hardwareNo: '',
        location: ''
      },
      content: {
        content: '',
        images: [],
        committerName: '',
        committerMobile: ''
      },
      status: {
        status: '',
        commitTime: ''
      },
      repairman: {
        mobile: '',
        level: '',
        name: ''
      }
    }
    let showModal = false,
      showImgs = false,
      initialSlide = 0,
      showCensor = false,
      failedReason = ''
    this.state = {
      data,
      showModal,
      showImgs,
      initialSlide,
      showCensor,
      failedReason
    }
  }
  fetchData = body => {
    let resource = '/api/work/order/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.setState(json.data)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    const body = {
      id: parseInt(this.props.match.params.id.slice(1), 10)
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  showAllocate = () => {
    this.setState({
      showModal: true
    })
  }
  close = () => {
    this.setState({
      showModal: false
    })
  }
  showImgs = e => {
    console.log(e.target.value)
    this.setState({
      showImgs: true,
      initialSlide: e.target.value
    })
  }
  closeImgs = () => {
    this.setState({
      showImgs: false
    })
  }
  confirmPost = () => {
    this.setState({
      showModal: false
    })
    const body = {
      id: parseInt(this.props.match.params.id.slice(1), 10)
    }
    this.fetchData(body)
  }
  cancel = () => {
    this.setState({
      showModal: false
    })
  }
  postFail = () => {
    if (this.state.censoring) {
      return
    }
    this.setState({
      censoring: true
    })
    let resource = '/api/work/sheet/censor'
    const body = {
      pass: 2,
      sourceId: parseInt(this.props.match.params.id.slice(1), 10),
      sourceType: 2,
      reason: this.state.failedReason
    }
    const cb = json => {
      const nextState = {
        censoring: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          nextState.showCensor = false
          const body = {
            id: parseInt(this.props.match.params.id.slice(1), 10)
          }
          this.fetchData(body)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  censorFail = () => {
    this.setState({
      showCensor: true
    })
  }
  censorSuccess = () => {
    let { censoring } = this.state
    if (censoring) {
      return
    }
    this.setState({
      censoring: true
    })

    let resource = '/api/work/sheet/censor'
    const body = {
      pass: 1,
      sourceId: parseInt(this.props.match.params.id.slice(1), 10),
      sourceType: 2
    }
    const cb = json => {
      this.setState({
        censoring: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          const body = {
            id: parseInt(this.props.match.params.id.slice(1), 10)
          }
          this.fetchData(body)
          Noti.hintOk('操作成功', '该任务已通过审核')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeFailReason = e => {
    this.setState({
      failedReason: e.target.value
    })
  }
  cancelCensor = () => {
    this.setState({
      showCensor: false
    })
  }
  confirmCensor = () => {
    this.postFail()
  }
  render() {
    // const {device,content,status,repairman,repairRating} = this.state.data
    const {
      images,
      schoolName,
      deviceType,
      location,
      exist,
      cause,
      description,
      userMobile,
      creatorName,
      systemJudgment,
      status,
      createTime,
      endTime
    } = this.state

    const imgs =
      images &&
      images.map((r, i) => {
        return (
          <img
            onClick={this.showImgs}
            value={i}
            key={i}
            src={CONSTANTS.FILEADDR + r}
            alt=""
            className="repairImg"
          />
        )
      })

    const carouselItems =
      images &&
      images.map((r, i) => {
        return (
          <img
            value={i}
            key={i}
            src={CONSTANTS.FILEADDR + r}
            alt=""
            className="carouselImg"
          />
        )
      })
    const carousel = (
      <Carousel
        style={{ backgroundColor: 'red' }}
        dots={true}
        accessibility={true}
        className="carouselItem"
        autoplay={true}
        arrows={true}
        initialSlide={this.state.initialSlide}
      >
        {carouselItems}
      </Carousel>
    )

    //handle the time
    let createTS = Time.getTimeStr(createTime)
    let stopT = endTime ? endTime : Date.parse(new Date())
    let timePassed = Time.getSpan(createTime, stopT)

    // let levelClass = repairman && (repairman.level === 3 ? 'red' : (repairman.level === 2 ? 'yellowfc' : ''))

    let waitingClass =
      status === TASK_PENDING
        ? 'waiting'
        : status === TASK_FINISHED ? 'finished' : 'repairing'

    /* 
    const repairmanInfo = (status===4 || status===3 || status===6 || status===7)&&(
      <div className='infoBlock halfWidth rightBlock'>
        <h3>维修员信息</h3>
        <ul>
          <li><p>维修员:</p>{repairman.name}</li>
          <li><p>维修员电话:</p>{repairman.mobile}</li>
          <li><p>任务紧急程度:</p><span className={levelClass}>{PRIORITY[repairman.level]}</span></li>
          {status===6?<li><p>拒绝原因:</p><span className='width200'>{repairman.refuseReason || '暂无'}</span></li>:null}
          {status===7?<li><p>使用配件:</p><span className='width200'>{repairman.components || '暂无'}</span></li>:null}
          {status===7?<li><p>维修结论:</p><span className='width200'>{repairman.conclusion || '暂无'}</span></li>:null}
        </ul>
      </div>)


    let rateInfo =  repairRating && (
      <div className='infoBlock halfWidth rightBlock'>
        <h3>用户评价</h3>
        <ul>
          <li><p>用户评分:</p>{repairRating.rating}</li>
          <li><p>快捷评价:</p>{repairRating.ratingOption}</li>
          <li className='itemsWrapper'><p>评价内容:</p><div className='paragraph'>{repairRating.ratingContent}</div></li>
        </ul>
      </div>
    )
    */

    return (
      <div className="infoBlockList repairInfo columnLayout">
        <div className="infoBlock halfWidth">
          <h3>设备信息</h3>
          <ul>
            <li>
              <p>学校名称:</p>
              {schoolName}
            </li>
            <li>
              <p>设备类型:</p>
              {deviceType ? typeName[deviceType] : '无'}
            </li>
            <li className="longText">
              <p>设备位置:</p>
              <span className="detailContent">
                <span>{location}</span>
                <span>{exist ? '' : ' (设备已解绑)'}</span>
              </span>
            </li>
          </ul>
        </div>

        <div className="infoBlock halfWidth">
          <h3>报修内容</h3>
          <ul>
            <li className="itemsWrapper">
              <p>设备问题:</p>
              <div>{cause || '暂无'}</div>
            </li>
            <li className="longText">
              <p>报修内容:</p>
              <span className="detailContent">{description || '暂无'}</span>
            </li>
            {images && images.length > 0 ? (
              <li className="imgWrapper">
                <p>报修图片:</p>
                {imgs}
              </li>
            ) : null}
            <li>
              <p>报修人电话:</p>
              {userMobile || '暂无'}
            </li>
            <li>
              <p>报修用户:</p>
              <span className="padR20">{creatorName}</span>
            </li>
            <li>
              <p>系统判定:</p>
              {systemJudgment || '暂无'}
            </li>
          </ul>
        </div>

        <div className="infoBlock halfWidth rightBlock">
          <h3>报修状态</h3>
          <ul>
            <li>
              <p>报修状态:</p>
              <span className={waitingClass}>{TASKSTATUS[status]}</span>
            </li>
            <li>
              <p>用户申请时间:</p>
              {createTS}
            </li>
            {status === TASK_FINISHED ? (
              <li>
                <p>维修完成时间:</p>
                <span>{endTime ? Time.getTimeStr(endTime) : '无'}</span>
              </li>
            ) : null}
            {status === TASK_FINISHED ? (
              <li>
                <p>维修用时:</p>
                {endTime ? Time.getTimeInterval(createTime, endTime) : '无'}
              </li>
            ) : (
              <li>
                <p>用户已等待时间:</p>
                {timePassed}
              </li>
            )}
          </ul>
        </div>

        <div className="btnArea">
          <Button onClick={this.back}>
            {this.props.location.state
              ? BACKTITLE[this.props.location.state.path]
              : '返回'}
          </Button>
        </div>

        <Modal
          visible={this.state.showImgs}
          title=""
          closable={false}
          onCancel={this.closeImgs}
          width={800}
          className="carouselModal"
          okText=""
          footer={null}
        >
          <div className="carouselContainer">
            {this.state.showImgs ? carousel : null}
          </div>
        </Modal>
      </div>
    )
  }
}

export default RepairInfo
