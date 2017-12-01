import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter, Link} from 'react-router-dom'
import 'antd/dist/antd.css'
import { Layout, Menu, Icon } from 'antd';
import LostDisp from './lost/lostDisp'
import './index.css'
import MyMenu from './side'

const { Content, Sider } = Layout;

class Layouts extends React.Component {
  state = {
    collapsed: false
  }
  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }
  render() {
    return (
      <Layout className='container'>
        <div className="logo hide">
            <img src="logo.png" alt='' />
        </div>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          className='nav'
        >
        <MyMenu />
        </Sider>
        <Layout>
          <Content className='content'>
            <div className='main'>
              <LostDisp />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

ReactDOM.render(
  (<BrowserRouter >
    <Layouts />
   </BrowserRouter>),
  document.getElementById('root') // eslint-disable-line no-undef
)
