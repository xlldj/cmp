import React, { Component } from 'react'
import { Modal, Button, Radio } from 'antd'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../action'
const subModule = 'fundCheck'

const RadioGroup = Radio.Group

class HandleModal extends Component {
  state = {
    note: '',
    needBalance: 1
  }
  changeBalance = e => {
    this.setState({ needBalance: e.target.value })
  }
  closeModal = e => {
    this.props.changeFund(subModule, { showHandleModal: false })
  }
  render() {
    const { note, needBalance } = this.state
    return (
      <Modal
        wrapClassName="modal finish"
        visible={true}
        width={450}
        title="立即处理"
        onCancel={this.closeModal}
        footer={null}
        okText=""
      >
        <div className="info">
          <ul style={{ backgroundColor: 'white', padding: '0px' }}>
            <li>
              <p>是否平账:</p>
              <RadioGroup onChange={this.changeBalance} value={needBalance}>
                <Radio value={1}>是</Radio>
                <Radio value={2}>否</Radio>
              </RadioGroup>
            </li>
            <li className="itemsWrapper">
              <p>处理方式记录:</p>
              <textarea
                value={note}
                className="longText"
                onChange={this.changeNote}
                placeholder="200字以内"
              />
            </li>
          </ul>
          <div
            className="btnArea"
            style={{ backgroundColor: 'white', paddingTop: '0px' }}
          >
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

export default withRouter(connect(null, { changeFund })(HandleModal))
