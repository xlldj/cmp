import React from 'react'
import AjaxHandler from '../ajax'
import 'antd/dist/antd.css'
import Select from 'antd/lib/select'
import notification from 'antd/lib/notification'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Button from 'antd/lib/button'
const FormItem = Form.Item;
const Option = Select.Option;

notification.config({
  placement: 'topRight',
  top: 200,
  duration: 1,
});

class RegistrationForm extends React.Component {
  state = {
    confirmDirty: false
  };

  close = () => {
    this.props.history.push('/')  
  };

  openNotification = () => {
    const key = `open${Date.now()}`;
    const btnClick = () => {
      // to hide notification box
      this.props.history.push('/')
      notification.close(key);
    };
    const btn = (
      <Button type="primary" size="small" onClick={btnClick}>
        登录
      </Button>
    );
    notification.open({
      message: '注册成功！',
      description: '马上转回登录页面，请继续登录~',
      btn,
      key,
      onClose: this.close,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values);

        let resource = '/api/register'
        //const values = {name: 'test', password: 'test'}
        const body = {
          nickName: values.username,
          mobile: values.phone,
          userType: values.role
        }
        console.log(body)
        const cb = (json) => {
            if(json.error){
              throw new Error(json.error.displayMessage || json.error.toString())
            }else{
              if(json.data){
                this.props.setUser(values.username)
                //this.openNotification()
                //return json
              }
            }
        }
        AjaxHandler.ajax(resource, body, cb)  
      }
    });
  }
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select style={{ width: 60 }}>
        <Option value="86">+86</Option>
        <Option value="87">+87</Option>
      </Select>
    );

    return (
      <Form className='registerForm infoList' hideRequiredMark onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="用户名"
          hasFeedback
        >
          {getFieldDecorator('username', {
            rules: [{
              required: true, message: '请输入用户名',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="密码"
          hasFeedback
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '请输入密码',
            }, {
              validator: this.checkConfirm,
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
          hasFeedback
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '请确认密码',
            }, {
              validator: this.checkPassword,
            }],
          })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="权限"
          hasFeedback
        >
          {getFieldDecorator('role', {
            rules: [
              { required: true, message: '请选择您的权限' },
            ],
          })(
            <Select placeholder="请选择您的权限">
              <Option value="ADMIN">管理员ADMIN</Option>
              <Option value="NORMAL">信息管理员</Option>
              <Option value='GUEST'>浏览</Option>
            </Select>
          )}
        </FormItem>        
        <FormItem
          {...formItemLayout}
          label={(
            <span>
              昵称&nbsp;
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('nickname', {
            rules: [{ required: true, message: '请输入昵称', whitespace: true }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="手机号"
        >
          {getFieldDecorator('phone', {
            rules: [{ required: true, message: '请输入手机号' }],
          })(
            <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">注册</Button>
        </FormItem>
      </Form>
    );
  }
}

const UserRegister = Form.create()(RegistrationForm);

export default UserRegister