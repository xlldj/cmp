import React from 'react';
import { Button, Popconfirm, Modal } from 'antd';
import Noti from '../noti';
import AjaxHandler from '../ajax';
import Bread from '../bread';
import './style/style.css';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { setRoleList } from '../../actions';

class AccountInfo extends React.Component {
  static propTypes = {
    roles: PropTypes.array.isRequired,
    rolesSet: PropTypes.bool.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      nickName: '',
      roles: [],
      visible: false,
      oldPwd: '',
      oldPwdError: false,
      new1: '',
      new1Error: false,
      new2: '',
      new2Error: false,
      modalError: false
    };
  }
  fetchRoles = () => {
    let resource = '/role/list';
    const body = {
      page: 1,
      size: 10000
    };
    const cb = json => {
      if (json.data.roles) {
        this.props.setRoleList({
          roles: json.data.roles,
          rolesSet: true
        });

        let roleName = [];
        this.state.roles.forEach(r => {
          let role = json.data.roles.find(ro => ro.id === r);
          if (role) {
            roleName.push(role.name);
          }
        });
        this.setState({
          roleName: roleName.join('、')
        });
      }
    };
    AjaxHandler.ajax(resource, body, cb);
  };
  fetchData = body => {
    let resource = '/api/employee/one';
    const cb = json => {
      if (json.data) {
        /*--------redirect --------*/
        let nextState = {
          account: json.data.account,
          nickName: json.data.nickName,
          roles: json.data.roles
        };
        let { rolesSet, roles } = this.props;
        if (rolesSet) {
          let roleName = [];
          json.data.roles.forEach(r => {
            let role = roles.find(ro => ro.id === r);
            if (role) {
              roleName.push(role.name);
            }
          });
          nextState.roleName = roleName.join('、');
        } else {
          this.fetchRoles();
        }
        this.setState(nextState);
      }
    };
    AjaxHandler.ajax(resource, body, cb);
  };
  componentDidMount() {
    this.props.hide(false);
    let { id } = this.props.user;
    const body = {
      id: id
    };
    this.fetchData(body);
  }
  componentWillUnmount() {
    // this.props.hide(true)
  }

  changePwd = e => {
    e.preventDefault();
    this.setState({
      visible: true
    });
  };
  logout = () => {
    this.props.logout();
    this.props.history.push('/');
  };
  cancel = () => {
    this.setState({
      visible: false
    });
  };
  changePassport = () => {
    let { new1, new2, oldPwd } = this.state;
    if (!new1 || !new2 || !oldPwd) {
      return this.setState({
        modalError: true
      });
    }
    if (new1 === new2 && new1 !== oldPwd) {
      this.postPwd();
      if (this.state.modalError) {
        this.setState({
          modalError: false
        });
      }
    } else {
      this.setState({
        modalError: true
      });
    }
  };
  postPwd = () => {
    let resource = '/user/password/update';
    const body = {
      newPassword: this.state.new1,
      oldPassword: this.state.oldPwd
    };
    const cb = json => {
      if (json.data) {
        Noti.hintOk('密码重置成功', '您可以继续其他操作');
        this.setState({
          visible: false
        });
      }
    };
    AjaxHandler.ajax(resource, body, cb);
  };
  changeOldPwd = e => {
    this.setState({
      oldPwd: e.target.value
    });
  };
  checkOldPwd = () => {
    if (!this.state.oldPwd) {
      return this.setState({
        oldPwdError: true
      });
    }
    this.setState({
      oldPwdError: false
    });
  };
  changeNew1 = e => {
    this.setState({
      new1: e.target.value
    });
  };
  checkNew1 = () => {
    if (!this.state.new1) {
      return this.setState({
        new1Error: true
      });
    }
    this.setState({
      new1Error: false
    });
  };
  changeNew2 = e => {
    this.setState({
      new2: e.target.value
    });
  };
  checkNew2 = () => {
    if (!this.state.new2) {
      return this.setState({
        new2Error: true
      });
    }
    this.setState({
      new2Error: false
    });
  };

  render() {
    let { account, roleName, nickName } = this.state;
    return (
      <div>
        <div className="breadc">
          <Bread parent="account" parentName="账号信息" />
        </div>

        <div className="disp">
          <div className="infoList accountInfo">
            <ul>
              <li>
                <p>员工账号:</p>
                {account}
              </li>
              <li>
                <p>登录密码:</p>
                <a href="" onClick={this.changePwd}>
                  更改密码
                </a>
              </li>
              <li>
                <p>员工姓名:</p>
                {nickName}
              </li>
              <li>
                <p>员工身份:</p>
                {roleName}
              </li>
            </ul>
            <div className="btnArea">
              <Popconfirm
                title="确定要退出么?"
                onConfirm={this.logout}
                onCancel={this.cancel}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary">退出登录</Button>
              </Popconfirm>
            </div>

            <div>
              <Modal
                title="修改密码"
                visible={this.state.visible}
                onOk={this.changePassport}
                onCancel={this.cancel}
                maskClosable={false}
                className="addSupplierModal"
              >
                <div style={{ marginBottom: '10px' }}>
                  <label>
                    请输入旧密码：<input
                      style={{
                        width: '60%',
                        height: '30px',
                        marginLeft: '20px'
                      }}
                      type="password"
                      value={this.state.oldPwd}
                      onChange={this.changeOldPwd}
                      onBlur={this.checkOldPwd}
                    />
                  </label>
                  {this.state.oldPwdError ? (
                    <span className="checkInvalid">请输入旧密码</span>
                  ) : null}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>
                    请输入新密码：<input
                      style={{
                        width: '60%',
                        height: '30px',
                        marginLeft: '20px'
                      }}
                      type="password"
                      value={this.state.new1}
                      onChange={this.changeNew1}
                      onBlur={this.checkNew1}
                    />
                  </label>
                  {this.state.new1Error ? (
                    <span className="checkInvalid">请输入旧密码</span>
                  ) : null}
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label>
                    再输入新密码：<input
                      style={{
                        width: '60%',
                        height: '30px',
                        marginLeft: '20px'
                      }}
                      type="password"
                      value={this.state.new2}
                      onChange={this.changeNew2}
                      onBlur={this.checkNew2}
                    />
                  </label>
                  {this.state.new2Error ? (
                    <span className="checkInvalid">请输入旧密码</span>
                  ) : null}
                </div>
                {this.state.modalError ? (
                  <span className="checkInvalid">
                    密码输入错误，请再次核对！
                  </span>
                ) : null}
              </Modal>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  roles: state.setRoleList.roles,
  rolesSet: state.setRoleList.rolesSet,
  user: state.setUserInfo
});

export default withRouter(
  connect(mapStateToProps, {
    setRoleList
  })(AccountInfo)
);
