/* ----------------------------权限列表----------------------------- */
/* ------------------------state description----------------------- */
/* 
*/

import React from 'react'
import SearchLine from '../../component/searchLine'
// import CONSTANTS from '../../component/constants'
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
    console.log(this.props.full)
    this.props.hide(false)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  delete = (id) => {
    try {
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
            authenStatus={this.props.full}
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
