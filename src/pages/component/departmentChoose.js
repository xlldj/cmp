import React from 'react'
import { Modal, Radio, Button } from 'antd'
import Noti from '../../util/noti'
import CONSTANTS from '../../constants'
import AjaxHandler from '../../util/ajax'

const RadioGroup = Radio.Group

class DepartmentChoose extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      level: 1,
      content: '',
      posting: false
    }
  }
  componentDidMount() {
    let { level } = this.props
    if (level) {
      this.setState({
        level: level
      })
    }
  }
  cancel = () => {
    this.props.cancel()
  }
  postData = body => {
    let resource = '/api/work/order/handle'
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.props.success()
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  confirm = () => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })
    const body = {
      type: CONSTANTS.TASK_HANDLE_REASSIGN,
      id: this.props.id,
      department: this.props.department,
      level: parseInt(this.state.level, 10),
      content: this.state.content.trim()
    }
    this.postData(body)
  }
  selectRow = (record, index, event) => {
    let selectedRows = [record]
    this.changeSelect(null, selectedRows)
  }

  changeUrgencyLevel = e => {
    this.setState({
      level: e.target.value
    })
  }
  changeNote = e => {
    this.setState({
      content: e.target.value
    })
  }
  render() {
    const { level, content } = this.state

    return (
      <Modal
        wrapClassName="modal reassign"
        width={330}
        title="工单转接"
        visible={true}
        onCancel={this.cancel}
        footer={null}
        okText=""
      >
        <div className="info buildTask">
          <ul>
            <li>
              <p>紧急程度:</p>
              <RadioGroup value={level} onChange={this.changeUrgencyLevel}>
                <Radio value={1}>普通</Radio>
                <Radio value={2}>优先</Radio>
                <Radio value={3}>紧急</Radio>
              </RadioGroup>
            </li>
            <li className="itemsWrapper">
              <p>备注:</p>
              <textarea
                value={content}
                className="longText"
                onChange={this.changeNote}
              />
            </li>
          </ul>
          <div className="btnArea">
            <Button onClick={this.confirm} type="primary">
              确认
            </Button>
            <Button onClick={this.cancel}>返回</Button>
          </div>
        </div>
      </Modal>
    )
  }
}

export default DepartmentChoose
