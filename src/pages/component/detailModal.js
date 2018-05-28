import React from 'react'
import { Modal } from 'antd'

const DetailModal = props => (
  <Modal
    title={props.title}
    visible={true}
    onCancel={props.closeModal}
    maskClosable={true}
    className="infoModal"
    footer={null}
    width={props.width || 400}
  >
    {props.children}
  </Modal>
)

export default DetailModal
