/* ----------------------------权限列表----------------------------- */
/* ------------------------state description----------------------- */
/* 
*/

import React from 'react'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'
import AuthenDataTable from '../../component/authenDataTable'
import Noti from '../../noti'
import AjaxHandler from '../../ajax'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setAuthenData } from '../../../actions'

class AuthenTable extends React.Component {
  static propTypes = {
    full: PropTypes.array.isRequired
  }
  constructor(props){
    super(props)
    this.state = {
    }
  }
  componentDidMount(){
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  delete = (key) => {
    try {
      let {full} = this.props
      let keys = key.split('-')
      let id = full[(keys[0] - 1)].children[(keys[1] - 1)].children[(keys[2] - 1)].children[keys[3]].id
      let resource = '/privilege/delete'
      const body = {
        id: id
      }
      const cb = (json) => {
        if (json.data.result) {
          Noti.hintOk('删除成功', '该权限已删除')
        } else {
          Noti.hintWarning('删除出错', json.data.failReason || '请稍后重试')
        }
      }
      AjaxHandler.ajax(resource, body, cb)
    } catch (e) {
      console.log(e)
    }
  }
  back = (e) => {
    this.props.history.goBack()
  }

  render () {
    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加权限点' addLink='/employee/authen/add'  />

        <div className='tableList authenTable'>
          <AuthenDataTable
            clickable={false}
            edit={true}
            delete={this.delete}
            authenStatus={CONSTANTS.authenData}
          />
        </div>

      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  full: state.setAuthenData.full
})

export default withRouter(connect(mapStateToProps, {
  setAuthenData
})(AuthenTable))
