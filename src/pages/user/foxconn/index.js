import React, { Fragment } from 'react'
import { Button, Upload, Icon } from 'antd'
import Noti from '../../../util/noti'
import CONSTANTS from '../../../constants'
import AjaxHandler from '../../../util/ajax'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import AddPlusAbs from '../../component/addPlusAbs'
import { deepCopy } from '../../../util/copy'
import { mul } from '../../../util/numberHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder, changeFund } from '../../../actions'
const userInfo = {
  userNo: '',
  userName: '',
  numError: false,
  nameError: false
}

const {
  Fushikang_Import_Methods,
  Import_Method_Manual,
  FILE_TYPE_XLSX
} = CONSTANTS
class UserInfoView extends React.Component {
  static propTypes = {
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      schoolId: '',
      importMethod: 1, // 1 for batch import, 2 for single import
      users: [deepCopy(userInfo)],
      userFile: [],
      loadingRatio: '',
      fileUploadFailure: false,
      fileUploadSuccess: false,
      fileUploading: false
    }
  }
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  postMessage = () => {
    if (!this.state.addingName) {
      return this.setState({
        empty: true
      })
    }
    if (this.state.messagePosting) {
      return
    }
    this.setState({
      messagePosting: true
    })
    let resource = '/api/notify/add',
      mobile = this.state.data.mobile
    const body = {
      content: this.state.addingName,
      type: 3,
      mobiles: [mobile]
    }
    const cb = json => {
      const nextState = {
        messagePosting: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.id) {
          Noti.hintSuccessWithoutSkip('发送成功')
          nextState.visible = false
        } else {
          Noti.hintWarning('数据出错')
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeAccount = (e, i) => {
    const users = deepCopy(this.state.users)
    users[i].userNo = e.target.value
    this.setState({
      users
    })
  }
  checkAccount = (e, i) => {
    const users = deepCopy(this.state.users)
    users[i].userNo = users[i].userNo.trim()
    if (users[i].account === '') {
      users[i].numError = true
    } else if (users[i].numError) {
      users[i].numError = false
    }
    this.setState({
      users
    })
  }
  changeName = (e, i) => {
    const users = deepCopy(this.state.users)
    users[i].userName = e.target.value
    this.setState({
      users
    })
  }
  checkName = (e, i) => {
    const users = deepCopy(this.state.users)
    users[i].userName = users[i].userName.trim()
    if (users[i].userName === '') {
      users[i].nameError = true
    } else if (users[i].nameError) {
      users[i].nameError = false
    }
    this.setState({
      users
    })
  }
  addUser = e => {
    const users = deepCopy(this.state.users)
    users.push(deepCopy(userInfo))
    this.setState({
      users
    })
  }
  abstractUser = e => {
    const users = deepCopy(this.state.users)
    users.pop()
    this.setState({
      users
    })
  }
  changeImportMethod = v => {
    this.setState({
      importMethod: +v
    })
  }
  cacheFile = ({ file, fileList }) => {
    const { type } = file
    if (type !== FILE_TYPE_XLSX) {
      return this.setState({
        fileTypeError: true
      })
    }
    this.setState({
      userFile: fileList
    })
  }
  deleteCertAndReupload = e => {
    this.setState({
      fileUploading: false,
      fileUploadSuccess: false,
      fileUploadFailure: false,
      userFile: []
    })
  }
  uploadFile = () => {
    this.setState({
      fileUploading: true
    })
    const { schoolId, userFile } = this.state
    const resource = '/api/user/add/import'
    const formData = new FormData()
    formData.append('file', userFile.file)
    const body = {
      schoolId,
      file: userFile.file
    }
    AjaxHandler.fetch(resource, body).then(json => {
      console.log(json)
      if (json && json.data) {
        this.setState(
          {
            uploadTaskId: json.data.taskId
          },
          this.checkProgress
        )
      } else {
        this.setState({
          fileUploading: false
        })
      }
    })
  }
  request = () => {
    // nothing
  }
  checkProgress = () => {
    const { taskId } = this.state
    const resource = '/api/user/add/import/percent'
    const body = {
      taskId
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        const { taskPercent, successTaskSize, failTaskSize } = json.data
        this.setState({ taskPercent, successTaskSize, failTaskSize }, () => {
          if (taskPercent < 1) {
            setTimeout(this.checkProgress, 0)
          } else {
            this.setState({
              fileUploading: false,
              fileUploadSuccess: true
            })
          }
        })
      }
    })
  }
  checkInfo = () => {
    const { schoolId, users } = this.state
    if (!schoolId) {
      this.setState({
        schoolError: true
      })
      return false
    }
    // importMethod always exist
    for (let i = 0, l = users.length; i < l; i++) {
      const u = users[i]
      if (!u.userNo) {
        users[i].numError = true
        this.setState(users)
        return false
      }
      if (!u.userName) {
        users[i].nameError = true
        this.setState(users)
        return false
      }
      delete users[i].numError
      delete users[i].nameError
    }
    return true
  }
  submitManual = () => {
    if (!this.checkInfo()) {
      return
    }
    const { schoolId, users, importMethod } = this.state
    const resource = '/api/user/add/handwork'
    const body = {
      importType: importMethod,
      schoolId: parseInt(schoolId, 10),
      users
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        Noti.hintSuccess(this.props.history, '/user')
      }
    })
  }
  changeSchool = v => {
    this.setState({
      schoolId: v
    })
  }
  checkSchool = v => {
    if (!v) {
      this.setState({
        schoolError: true
      })
    } else if (this.state.schoolError) {
      this.setState({
        schoolError: false
      })
    }
  }
  render() {
    let {
      schoolId,
      schoolError,
      users,
      importMethod,
      userFile,
      fileUploading,
      fileUploadSuccess,
      fileTypeError,
      taskPercent,
      successTaskSize,
      failTaskSize
    } = this.state
    const userInfos = users.map((u, i) => (
      <Fragment>
        <li>
          <p>登录账号(工号):</p>
          <input
            value={u.userNo}
            onChange={e => this.changeAccount(e, i)}
            onBlur={e => this.checkAccount(e, i)}
          />
          {u.numError ? (
            <span className="checkInvalid">请输入登录账号！</span>
          ) : null}
        </li>

        <li>
          <p>姓名:</p>
          <input
            value={u.userName}
            onChange={e => this.changeName(e, i)}
            onBlur={e => this.checkName(e, i)}
          />
          {u.nameError ? (
            <span className="checkInvalid">请输入名字！</span>
          ) : null}
        </li>
      </Fragment>
    ))
    const loadingInfo = fileUploading
      ? `正在写入数据库，已进行${mul(
          taskPercent || 0,
          100
        )}%。写入成功${successTaskSize || 0}条，失败${failTaskSize || 0}条。`
      : ''
    return (
      <div className="infoList">
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">请选择学校</span>
            ) : null}
          </li>
          <li>
            <p>导入方式:</p>
            <BasicSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={importMethod}
              staticOpts={Fushikang_Import_Methods}
              changeOpt={this.changeImportMethod}
            />
          </li>
          {importMethod === Import_Method_Manual ? (
            <Fragment>
              {userInfos}
              <li>
                <p />
                <AddPlusAbs
                  count={users.length}
                  add={this.addUser}
                  abstract={this.abstractUser}
                />
              </li>
            </Fragment>
          ) : (
            <Fragment>
              <li>
                <p>导入文件模版:</p>
                <a
                  href="http://xiaolian-image-prod.oss-cn-shenzhen.aliyuncs.com/foxconn/foxconn_empoyee.xlsx"
                  download="foxconn_template.xlsx"
                >
                  点击下载
                </a>
              </li>
              <li className="imgWrapper">
                <p>上传导入文件:</p>
                <div>
                  {userFile && userFile.length > 0 ? (
                    <Fragment>
                      <span>{userFile[0].originFileObj.name}</span>
                      {fileUploading ? (
                        loadingInfo
                      ) : (
                        <Button type="primary" onClick={this.uploadFile}>
                          开始上传
                        </Button>
                      )}
                      <Button
                        type="primary"
                        onClick={this.deleteCertAndReupload}
                      >
                        {fileUploadSuccess ? '继续选择文件' : '重新选择文件'}
                      </Button>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <Upload
                        listType="picture-card"
                        fileList={userFile}
                        onChange={this.cacheFile}
                        customRequest={this.request}
                      >
                        {userFile.length >= 1 ? null : (
                          <div className="uploadButton">
                            <Icon type="plus" />
                          </div>
                        )}
                      </Upload>
                      {fileTypeError ? '请上传.xlsx格式的文件' : null}
                    </Fragment>
                  )}
                </div>
              </li>
            </Fragment>
          )}
        </ul>
        <div className="btnArea">
          {importMethod === Import_Method_Manual ? (
            <Button type="primary" onClick={this.submitManual}>
              确认
            </Button>
          ) : null}
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

const mapStateToInfoProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

export default withRouter(
  connect(mapStateToInfoProps, {
    changeOrder,
    changeFund
  })(UserInfoView)
)
