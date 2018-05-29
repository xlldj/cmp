import React from 'react'
import { Modal, Button } from 'antd'
import BasicSelector from '../../../component/basicSelectorWithoutAll'
import CONSTANTS from '../../../../constants/index'
import AjaxHandler from '../../../../mock/ajax'
import { saveQuickMsg } from '../controller'
const { QUICK_MSGLIST_TYPE } = CONSTANTS
class QuickInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      msgTypeId: 1,
      content: ''
    }
  }
  componentDidMount() {
    const { selectedMsg, editMsg } = this.props
    if (editMsg && selectedMsg) {
      const body = {
        id: selectedMsg
      }
      this.setState({
        id: selectedMsg
      })
      this.fetchData(body)
      return
    }
  }
  fetchData(body) {
    const resource = '/work/order/quick_msg/one'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json.data) {
        const { content, msgTypeId } = json.data
        this.setState({
          content: content,
          msgTypeId: msgTypeId
        })
      }
    })
  }
  changeOpt = v => {
    const { msgTypeId } = this.state
    if (v !== msgTypeId) {
      this.setState({
        msgTypeId: v
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
    const { closeQuickInfo } = this.props
    saveQuickMsg(body, closeQuickInfo)
  }
  render() {
    const {
      isShowQuickInfo,
      closeQuickInfo,
      quickInfoTitle: title
    } = this.props
    const { content, msgTypeId } = this.state
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
                staticOpts={QUICK_MSGLIST_TYPE}
                selectedOpt={msgTypeId}
                changeOpt={this.changeOpt}
              />
            </li>
            <li style={{ height: 'auto', lineHeight: '30px' }}>
              <textarea
                style={{ width: '100%', height: '150px' }}
                value={content}
                placeholder="请输入快捷消息"
                onChange={event => this.changeContent(event)}
              />
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
