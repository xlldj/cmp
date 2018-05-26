import React from 'react'
import { Modal, Button } from 'antd'
import BasicSelector from '../../../component/basicSelector'
import CONSTANTS from '../../../../constants'

const FinishTaskModal = props => {
  const { type, tags, tagError, tag, note, finishContentError } = props
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
export default FinishTaskModal
