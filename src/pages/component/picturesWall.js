import React from 'react'
import { Upload, Icon, Modal } from 'antd'
import CONSTANTS from '../../constants'
import AjaxHandler from '../../util/ajax'
import Noti from '../../util/noti'
const FILEADDR = CONSTANTS.FILEADDR
const DURATION = 30 * 1000 // 30s

class PicturesWall extends React.Component {
  state = {
    previewVisible: false,
    previewImage: '',
    fileList: []
  }

  componentDidMount() {
    this.setState({
      fileList: this.props.fileList
    })
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.fileList) !== JSON.stringify(this.props.fileList)
    ) {
      this.setState({
        fileList: JSON.parse(JSON.stringify(nextProps.fileList))
      })
    }
  }

  handleCancel = () => this.setState({ previewVisible: false })

  remove = file => {
    if (this.props.disabled) {
      return false
    }
    let fileList = JSON.parse(JSON.stringify(this.state.fileList))
    let fIndex = fileList.findIndex((r, i) => r.uid === file.uid)
    fileList.splice(fIndex, 1)
    this.setState({
      fileList: fileList
    })
    this.props.setImages(fileList)
  }

  handlePreview = file => {
    if (this.props.disabled) {
      return
    }
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    })
  }

  handleChange = ({ fileList }) => {
    this.setState({ fileList })
  }

  postToOss = file => {
    let { host, accessId, policy, signature, fileName } = this.state

    /* build body */
    let body = new FormData()
    let key =
      (this.props.dir ? this.props.dir : 'no_category') +
      '/' +
      fileName +
      this.getSuffix(file.name)
    body.append('key', key)
    body.append('OSSAccessKeyId', accessId)
    body.append('policy', policy)
    body.append('signature', signature)
    body.append('file', file)

    /* post img */
    fetch(host, { method: 'POST', body: body, mode: 'cors' })
      .then(response => {
        if (response.status === 204) {
          /* set img into filelist */
          let fileList = JSON.parse(JSON.stringify(this.state.fileList))
          let l = fileList.length
          fileList[l - 1].status = 'done'
          fileList[l - 1].url = FILEADDR + key
          fileList[l - 1].percent = 100
          this.setState({
            fileList: fileList
          })
          this.props.setImages(fileList)
        }
      })
      .catch(e => {
        Noti.hintLock('上传出错', '网络出错，请稍后重试！')
      })
  }

  getOssParams = file => {
    let resource = '/oss/signature/one'
    const body = {
      dir: this.props.dir
    }
    const cb = json => {
      if (json.data) {
        this.setState(json.data)
        this.postToOss(file)
      } else {
        throw new Error({
          title: '请求出错',
          message: '网络出错，请稍后重试！'
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  randomString = len => {
    len = len || 32
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    var maxPos = chars.length
    var pwd = ''
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  }

  getSuffix = filename => {
    let pos = filename.lastIndexOf('.')
    let suffix = ''
    if (pos !== -1) {
      suffix = filename.substring(pos)
    }
    return suffix
  }
  request = e => {
    let { expire } = this.state
    if (expire && expire < Date.parse(new Date()) + DURATION) {
      this.postToOss(e.file)
      return
    }
    this.getOssParams(e.file)
  }

  render() {
    const { previewVisible, previewImage, fileList } = this.state
    const uploadButton = (
      <div className="uploadButton">
        <Icon type="plus" />
      </div>
    )
    let cn = 'clearfix'
    const disabled = this.props.disabled ? this.props.disabled : false
    return (
      <div className={cn}>
        <Upload
          accept={this.props.accept ? this.props.accept : 'image/*'}
          action={CONSTANTS.FILESERVER}
          listType="picture-card"
          disabled={disabled}
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          onRemove={this.remove}
          customRequest={this.request}
        >
          {fileList.length >= (this.props.limit || 3) ? null : uploadButton}
        </Upload>
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

export default PicturesWall
