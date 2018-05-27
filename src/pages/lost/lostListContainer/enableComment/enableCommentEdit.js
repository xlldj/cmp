import React from 'react'
import { Button, Radio, Popconfirm } from 'antd'
import SchoolSelector from '../../../component/schoolSelectorWithoutAll'
import DetailModal from '../../../component/detailModal'
const RadioGroup = Radio.Group

export default class EnableCommentEdit extends React.Component {
  state = {
    schoolError: false,
    schoolId: '',
    status: false,
    posting: false
  }
  componentDidMount() {
    const { selectedDetailId, dataSource } = this.props
    if (selectedDetailId !== -1) {
      let selected = dataSource.find(data => data.id === selectedDetailId)
      if (selected) {
        const schoolId = selected.schoolId
        const status = selected.status
        this.setState({
          schoolId,
          status
        })
      }
    }
  }
  changeSchool = v => {
    this.setState({
      schoolId: v
    })
  }
  changeStatus = e => {
    this.setState({
      status: e.target.value
    })
  }
  checkReady = () => {
    const { schoolId } = this.state
    if (!schoolId) {
      this.setState({
        schoolError: true
      })
      return false
    }
    return true
  }
  confirm = e => {
    if (!this.checkReady()) {
      return
    }
    const { schoolId, status, posting } = this.state

    const { selectedDetailId } = this.props
    const body = {
      schoolId: +schoolId,
      status
    }
    if (selectedDetailId) {
      body.id = selectedDetailId
    }
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    this.props.confirm(body)
  }
  render() {
    const { schoolId, status, schoolError } = this.state
    return (
      <DetailModal title="评论上线设置" closeModal={this.props.closeModal}>
        <ul className="modalDetails_wrapper">
          <li>
            <label>选择上线学校:</label>
            <div className="contentValue">
              <SchoolSelector
                selectedSchool={schoolId}
                width={150}
                changeSchool={this.changeSchool}
              />
              {schoolError ? (
                <span className="checkInvalid">请选择学校!</span>
              ) : null}
            </div>
          </li>
          <li>
            <label htmlFor="name">是否上线评论功能:</label>
            <div className="contentValue">
              <RadioGroup value={status} onChange={this.changeStatus}>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>
            </div>
          </li>
        </ul>
        <div className="btnArea">
          <Popconfirm
            title="确定要设置评论状态么?"
            onConfirm={this.confirm}
            onCancel={null}
            okText="确认"
            cancelText="取消"
          >
            <Button type="primary">确认</Button>
          </Popconfirm>
          <Button onClick={this.props.closeModal}>取消</Button>
        </div>
      </DetailModal>
    )
  }
}
