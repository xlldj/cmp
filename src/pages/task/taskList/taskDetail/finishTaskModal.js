import React, { Component } from 'react'
import { Modal, Button } from 'antd'
import BasicSelector from '../../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../../../constants'
import AjaxHandler from '../../../../util/ajax'
import Noti from '../../../../util/noti'
import { connect } from 'react-redux'
const { TASK_TYPE_REPAIR, TASK_BUILD_CMP } = CONSTANTS
const subModule = 'taskDetail'

class FinishTaskModal extends Component {
  state = {
    tagError: false,
    note: '',
    finishContentError: false,
    tag: '',
    posting: false
  }
  changeTag = v => {
    this.setState({
      tag: v,
      tagError: false
    })
  }
  checkTag = v => {
    if (!v) {
      this.setState({
        tagError: true
      })
    }
  }
  closeFinishModal = () => {
    this.setState({
      note: '',
      tag: '',
      tagError: false,
      finishContentError: false
    })
  }
  changeNote = e => {
    this.setState({
      note: e.target.value,
      finishContentError: false
    })
  }
  confirmFinish = () => {
    let { note, tag, posting } = this.state
    const { selectedDetailId: id } = this.props
    let { type } = this.props.data || {}
    if (posting) {
      return
    }
    if (!tag) {
      return this.setState({
        tagError: true
      })
    }
    let content = note.trim()
    // content must not be empty when finishing repair task
    if (type === TASK_TYPE_REPAIR && !content) {
      return this.setState({
        finishContentError: true
      })
    }

    let resource = '/work/order/handle'
    const body = {
      id: id,
      type: CONSTANTS.TASK_HANDLE_FINISH, // finish
      env: TASK_BUILD_CMP,
      tag: +tag
    }
    if (content) {
      body.content = content
    }
    const cb = json => {
      let nextState = {
        posting: false
      }
      if (json.data.result) {
        // success
        nextState.note = ''
        nextState.tag = ''
        Noti.hintOk('操作成功', '当前工单已完结')
        // refetch details
        this.props.updateAndClose(id)
      } else {
        Noti.hintWarning('', json.data.failReason || '操作失败，请稍后重试')
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  closeFinishModal = () => {
    this.props.changeTask(subModule, {
      showFinishModal: false
    })
  }
  render() {
    const { tagError, note, finishContentError, tag } = this.state
    const { data, tags } = this.props
    const { type } = data
    return (
      <Modal
        wrapClassName="modal finish"
        width={450}
        title="工单完结"
        visible={true}
        onCancel={this.closeFinishModal}
        footer={null}
        okText=""
      >
        <div className="info buildTask">
          {type === CONSTANTS.TASK_TYPE_REPAIR ? (
            <p className="red modalTitle">
              该工单还未指派维修员处理，请告知用户原因
            </p>
          ) : null}
          <ul>
            <li>
              <p>选择标签:</p>
              <BasicSelector
                staticOpts={tags}
                width={150}
                selectedOpt={tag}
                changeOpt={this.changeTag}
                checkOpt={this.checkTag}
                invalidTitle="选择标签"
              />
              {tagError ? (
                <span className="checkInvalid">请选择标签！</span>
              ) : null}
            </li>
            <li className="itemsWrapper">
              <p>备注:</p>
              <textarea
                value={note}
                className="longText"
                onChange={this.changeNote}
                placeholder="200字以内"
              />
            </li>
            {finishContentError ? (
              <span className="checkInvalid">
                关闭维修工单时, 内容会被发给用户，不能为空！
              </span>
            ) : null}
          </ul>
          <div className="btnArea">
            <Button onClick={this.confirmFinish} type="primary">
              确认
            </Button>
            <Button onClick={this.closeFinishModal}>返回</Button>
          </div>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  tags: state.setTagList
})
export default connect(mapStateToProps, {})(FinishTaskModal)
