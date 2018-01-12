import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { asyncComponent } from './pages/component/asyncComponent';
import { setLog, getLog, getStore, removeStore } from './pages/util/storage';
import './pages/style/index.css';

import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
const store = configureStore();

//const Layout = asyncComponent(() => import(/* webpackChunkName: "layout" */ "antd/lib/layout"))
const Log = asyncComponent(() =>
  import(/* webpackChunkName: "log" */ './pages/log/log')
);
const Main = asyncComponent(() =>
  import(/* webpackChunkName: "main" */ './pages/main')
);

const user = {
  name: '',
  id: 0,
  portrait: ''
};
const getConfirmation = (message, callback) => {
  const allowTransition = window.confirm(message);
  callback(allowTransition);
};
class Layouts extends React.Component {
  state = {
    logged: false,
    user: user
  };
  componentDidMount() {
    let logged = getLog(),
      username = getStore('username'),
      id = getStore('userId');
    if (logged) {
      let user = {
        name: username,
        id: id
      };
      this.setState({
        logged: true,
        user: user
      });
    }
  }
  login = user => {
    this.setState({
      user: user,
      logged: true
    });
    setLog();
  };
  logout = () => {
    removeStore('logged');
    this.setState({
      logged: false
    });
  };
  changeCurrentName = nickName => {
    let user = JSON.parse(JSON.stringify(this.state.user));
    user.name = nickName;
    this.setState({
      user: user
    });
  };
  hide = v => {
    // hide means if to hide the main content or not
    let loading = this.refs.loading,
      logged = this.state.logged;
    if (v) {
      // loading , need to show the loading div
      logged && loading && loading.classList.remove('hide');
    } else {
      // add 'hide' to not display loading
      loading && loading.classList.add('hide');
    }
  };
  render() {
    const { logged, user } = this.state;
    //const main = (<Route render={(props) => (<Main user={user} {...props} />)}  />)

    const log = <Log login={this.login} />;
    const main = (
      <Main
        user={user}
        logout={this.logout}
        changeCurrentName={this.changeCurrentName}
        hide={this.hide}
      />
    );

    const component = logged ? main : log;

    return (
      <div class="home">
        <div className="pageLoading hide" ref="loading">
          加载中...
        </div>
        <Switch>
          <Route render={() => component} />
        </Switch>
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <Router getUserConfirmation={getConfirmation}>
      <Layouts />
    </Router>
  </Provider>,
  document.getElementById('root')
);
