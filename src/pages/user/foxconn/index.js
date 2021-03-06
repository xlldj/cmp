import React, { Fragment } from 'react'
import { Button, Upload, Icon } from 'antd'
import Noti from '../../../util/noti'
import CONSTANTS from '../../../constants'
import AjaxHandler from '../../../util/ajax'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import AddPlusAbs from '../../component/addPlusAbs'
import { deepCopy } from '../../../util/copy'
import { mul } from '../../../util/numberHandle'
import { checkObject } from '../../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder, changeFund } from '../../../actions'
const userInfo = {
  userNo: '',
  userName: '',
  errorMsg: ''
}

const {
  Fushikang_Import_Methods,
  Import_Method_Manual,
  FILE_TYPE_XLSX
} = CONSTANTS

class FoxImportView extends React.Component {
  static propTypes = {
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      schoolId: '',
      importMethod: 1, // 1 for batch import, 2 for manual import
      users: [deepCopy(userInfo)],
      userFile: [],
      loadingRatio: '',
      fileUploadFailure: false,
      fileUploadSuccess: false,
      fileUploading: false,
      stopFetchPercent: false,
      schoolOpts: {}
    }
  }
  componentDidMount() {
    if (this.props.schoolSet) {
      this.setSchoolOpts(this.props)
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!checkObject(this.props.schools, nextProps.schools, ['schoolSet'])) {
      this.setSchoolOpts(nextProps)
    }
  }
  setSchoolOpts = props => {
    const fox_index = props.schools.findIndex(s => s.name === '富士康')
    const schoolOpts = {}
    if (fox_index !== -1) {
      const school = props.schools[fox_index]
      schoolOpts[school.id] = school.name
      this.setState({
        schoolOpts,
        schoolId: school.id
      })
    }
    const foxCompany_index = props.schools.findIndex(
      s => s.name === '富士康工厂'
    )
    if (foxCompany_index !== -1) {
      const school = props.schools[foxCompany_index]
      schoolOpts[school.id] = school.name
      this.setState({
        schoolOpts,
        schoolId: school.id
      })
    }
  }
  back = () => {
    this.props.history.goBack()
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
    // trim
    users[i].userNo = users[i].userNo.trim()
    // check if empty
    const userNo = users[i].userNo
    if (userNo === '') {
      users[i].errorMsg = '账号不能为空'
      return this.setState({ users })
    }
    // check if same to editing items
    const duplicateLocal =
      users.findIndex((u, ind) => i !== ind && u.userNo === userNo) !== -1
    if (duplicateLocal) {
      users[i].errorMsg = '已存在相同的用户账号'
      return this.setState({ users })
    }
    if (users[i].errorMsg) {
      users[i].errorMsg = ''
    }
    this.setState(
      {
        users
      },
      () => this.checkUserNo(userNo)
    )
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
      userFile: [],
      stopFetchPercent: true // always stop fetching percent
    })
  }
  uploadFile = () => {
    this.setState({
      fileUploading: true
    })
    const { schoolId, userFile } = this.state
    const file = userFile[0].originFileObj
    const resource = '/api/user/auth/add/import'
    AjaxHandler.postFile(file, resource, {
      keys: [{ key: 'schoolId', value: schoolId }]
    }).then(json => {
      if (json && json.data) {
        this.setState(
          {
            taskId: json.data.taskId,
            stopFetchPercent: false
          },
          this.checkProgress
        )
      } else {
        this.setState({
          fileUploading: false
        })
        Noti.hintNetworkError()
      }
    })
  }
  request = () => {
    // nothing
  }
  checkProgress = () => {
    const { taskId } = this.state
    const resource = '/api/user/auth/add/import/percent'
    const body = {
      taskId
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        const { taskPercent, successTaskSize, failTaskSize } = json.data
        this.setState({ taskPercent, successTaskSize, failTaskSize }, () => {
          if (taskPercent < 1 && !this.state.stopFetchPercent) {
            setTimeout(this.checkProgress, 0)
          } else if (this.state.fileUploading) {
            this.setState({
              fileUploading: false,
              fileUploadSuccess: true
            })
          }
        })
      } else {
        this.setState({
          fileUploading: false
        })
      }
    })
  }
  /**
   * check if needed inputs are ready. This only happens with 'importMethod' === 'manual'.
   * If no ready, this will setState of corresponding state.
   * @return {bool} :true if inputs are ready.
   */
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
        users[i].errorMsg = '账号不能为空'
        this.setState(users)
        return false
      }
      if (!u.userName) {
        users[i].nameError = true
        this.setState(users)
        return false
      }

      // check if same to editing items
      const duplicateLocal =
        users.findIndex(
          (user, ind) => i !== ind && user.userNo === u.userNo
        ) !== -1
      if (duplicateLocal) {
        users[i].errorMsg = '已存在相同的用户账号'
        this.setState({ users })
        return false
      }

      delete users[i].errorMsg
      delete users[i].nameError
    }
    return true
  }
  /**
   * check if the userNo or userNos exist in database
   * if 'userNo' is empty, check all the users
   * @param {? int}   userNo   :the userNo to be checked
   * @return {Promise}
   */
  checkUserNo = userNo => {
    const resource = '/api/user/auth/import/check'
    const body = {}
    if (userNo) {
      body.userNos = [userNo]
    } else {
      body.userNos = this.state.users.map(u => u.userNo)
    }
    if (this.state.checking) {
      return new Promise((resolve, reject) => {
        reject()
      })
    }
    this.setState({
      checking: true
    })
    return AjaxHandler.fetch(resource, body).then(json => {
      const users = deepCopy(this.state.users)
      const nextState = { checking: false }
      if (json && json.data) {
        const { result, duplicates } = json.data
        if (result) {
          // already exist
          duplicates.forEach(d => {
            const index = users.findIndex(u => u.userNo === d)
            if (index !== -1) {
              users[index].errorMsg = '此账号已注册，请重新输入'
            }
          })
        } else {
          if (userNo) {
            const index = users.findIndex(u => u.userNo === userNo)
            if (index !== -1) {
              users[index].errorMsg = ''
            }
          } else {
            users.forEach(u => (u.errorMsg = ''))
          }
        }
      }
      nextState.users = users
      this.setState(nextState)
    })
  }
  confirmManual = () => {
    if (!this.checkInfo()) {
      return
    }
    this.checkUserNo().then(json => {
      // users.errorMsg will be cleard in checking, if not, means error exist
      const users = deepCopy(this.state.users)
      const hasError = users.some(u => !!u.errorMsg)
      if (!hasError) {
        this.postInfo()
      }
    })
  }
  postInfo = () => {
    const { schoolId, users, importMethod } = this.state
    const resource = '/api/user/auth/add/handwork'
    const body = {
      importType: importMethod,
      schoolId: parseInt(schoolId, 10),
      users
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data.result) {
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
      failTaskSize,
      schoolOpts
    } = this.state
    const userInfos = users.map((u, i) => (
      <Fragment key={`people${i}`}>
        <li>
          <p>登录账号(工号):</p>
          <input
            value={u.userNo}
            onChange={e => this.changeAccount(e, i)}
            onBlur={e => this.checkAccount(e, i)}
          />
          {u.errorMsg ? (
            <span className="checkInvalid">{u.errorMsg}</span>
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
            <span className="checkInvalid">名称不能为空</span>
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
    const batchImportFragment = (
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
                <Button type="primary" onClick={this.deleteCertAndReupload}>
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
    )
    return (
      <div className="infoList">
        <ul>
          <li>
            <p>学校:</p>

            <BasicSelectorWithoutAll
              width={CONSTANTS.SELECTWIDTH}
              staticOpts={schoolOpts}
              selectedOpt={schoolId}
              changeOpt={this.changeSchool}
              checkOpt={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
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
          {schoolId && importMethod === Import_Method_Manual ? (
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
          ) : schoolId ? (
            batchImportFragment
          ) : null}
        </ul>
        <div className="btnArea">
          {importMethod === Import_Method_Manual ? (
            <Button type="primary" onClick={this.confirmManual}>
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
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  schools: state.setSchoolList.schools,
  schoolSet: state.setSchoolList.schoolSet
})

export default withRouter(
  connect(mapStateToInfoProps, {
    changeOrder,
    changeFund
  })(FoxImportView)
)
