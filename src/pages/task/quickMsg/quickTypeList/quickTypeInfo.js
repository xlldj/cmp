import React from 'react'
import { Modal, Button } from 'antd'
// import AjaxHandler from '../../../../mock/ajax'
import AjaxHandler from '../../../../util/ajax'
import { saveQuickType } from '../controller'
class QuickTypeInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      description: ''
    }
  }
  componentDidMount() {
    const { editTypeInfo, selectedType, selectTypeRecord } = this.props
    if (editTypeInfo && selectedType) {
      const { description } = selectTypeRecord
      this.setState({
        description: description,
        id: selectedType
      })
      return
    }
  }
  fetchData(body) {
    const resource = '/work/order/quickMsg/type/one'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json.data) {
        const { description } = json.data
        this.setState({
          description: description
        })
      }
    })
  }
  changeContent = event => {
    const value = event.target.value
    const { description } = this.state
    if (value !== description) {
      this.setState({
        description: value
      })
    }
  }
  confirmQuick = () => {
    const { description, id } = this.state
    const body = {
      description
    }
    if (id) {
      body.id = id
    }
    if (!description || description.length > 6) {
      return this.setState({
        contentError: true
      })
    }
    const { closeQuickTypeInfo } = this.props
    saveQuickType(body, closeQuickTypeInfo)
  }
  checkContent = v => {
    const value = v.target.value
    if (value && value.length <= 6) {
      return this.setState({
        contentError: false
      })
    }
    return this.setState({
      contentError: true
    })
  }
  render() {
    const {
      isShowQuickTypeInfo,
      closeQuickTypeInfo,
      quickTypeInfoTitle: title
    } = this.props
    const { description, contentError } = this.state
    return (
      <Modal
        wrapClassName="modal"
        width={450}
        title={title}
        visible={isShowQuickTypeInfo}
        onCancel={closeQuickTypeInfo}
        footer={null}
      >
        <div className="info buildTask">
          <ul>
            <li style={{ flexWrap: 'wrap' }}>
              <input
                style={{ width: '100%' }}
                value={description}
                placeholder="不超过6个字"
                onChange={event => this.changeContent(event)}
                onBlur={this.checkContent}
              />
              {contentError ? (
                <span className="checkInvalid">消息类型在0-6字之间</span>
              ) : null}
            </li>
          </ul>
          <div className="btnArea">
            <Button onClick={this.confirmQuick} type="primary">
              确认
            </Button>
            <Button onClick={closeQuickTypeInfo}>返回</Button>
          </div>
        </div>
      </Modal>
    )
  }
}
export default QuickTypeInfo
