import React from 'react'
import { Modal, Button } from 'antd'
import BasicSelector from '../../../component/basicSelectorWithoutAll'

import { saveQuickMsg } from '../controller'
class QuickInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      msgTypeId: 1,
      content: ''
    }
  }
  componentDidMount() {
    const { selectedMsg, editMsg, selectRecord } = this.props
    if (editMsg && selectedMsg) {
      const { content, msgTypeId } = selectRecord
      this.setState({
        content: content,
        msgTypeId: msgTypeId,
        id: selectedMsg
      })
      return
    }
  }
  changeOpt = v => {
    const { msgTypeId } = this.state
    if (v !== msgTypeId) {
      this.setState({
        msgTypeId: v
      })
    }
  }
  checkContent = v => {
    const value = v.target.value
    if (value && value.length < 200) {
      this.setState({
        contentError: false
      })
    } else {
      this.setState({
        contentError: true
      })
    }
  }
  changeContent = event => {
    const value = event.target.value
    const { content } = this.state
    if (value !== content) {
      this.setState({
        content: value
      })
    }
  }
  confirmQuick = () => {
    const { content, id, msgTypeId } = this.state
    const body = {
      content,
      msgTypeId
    }
    if (id) {
      body.id = id
    }
    if (!content || content.length > 200) {
      return this.setState({
        contentError: true
      })
    }
    const { closeQuickInfo } = this.props
    saveQuickMsg(body, closeQuickInfo)
  }
  getMsgList() {
    const { quickTypeList } = this.props
    const quickTypes = {}
    quickTypeList.forEach((quickType, index) => {
      quickTypes[quickType.id] = quickType.description
    })
    return quickTypes
  }
  render() {
    const {
      isShowQuickInfo,
      closeQuickInfo,
      quickInfoTitle: title
    } = this.props
    const { content, msgTypeId, contentError } = this.state
    return (
      <Modal
        wrapClassName="modal"
        width={450}
        title={title}
        visible={isShowQuickInfo}
        onCancel={closeQuickInfo}
        footer={null}
      >
        <div className="info buildTask">
          <ul>
            <li>
              <BasicSelector
                className="customSelect"
                staticOpts={this.getMsgList()}
                selectedOpt={msgTypeId}
                changeOpt={this.changeOpt}
              />
            </li>
            <li
              style={{ height: 'auto', lineHeight: '30px', flexWrap: 'wrap' }}
            >
              <textarea
                style={{ width: '100%', height: '150px' }}
                value={content}
                placeholder="请输入快捷消息"
                onBlur={this.checkContent}
                onChange={event => this.changeContent(event)}
              />
              {contentError ? (
                <span className="checkInvalid">消息内容在0-200字之间</span>
              ) : null}
            </li>
          </ul>
          <div className="btnArea">
            <Button onClick={this.confirmQuick} type="primary">
              确认
            </Button>
            <Button onClick={closeQuickInfo}>返回</Button>
          </div>
        </div>
      </Modal>
    )
  }
}
export default QuickInfo
