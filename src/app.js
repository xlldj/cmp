import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { setUserInfo } from './actions'
import { setLog, getLog, getStore, removeStore } from './util/storage'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Main from './pages/main'
import Log from './pages/log/log'

class App extends React.Component {
  state = {
    logged: false
  }
  componentDidMount() {
    let logged = getLog()
    if (logged) {
      // if logged, must have 'user' in sessionStorage.
      let userStr = getStore('user'),
        user = {}
      // this.props.setUserInfo(user);
      if (userStr) {
        user = JSON.parse(userStr)
      }
      this.props.setUserInfo(user)
      this.setState({
        logged: true
      })
    }
  }
  login = () => {
    this.setState({
      logged: true
    })
    setLog()
  }
  logout = () => {
    removeStore('logged')
    this.setState({
      logged: false
    })
  }
  changeCurrentName = nickName => {
    let user = JSON.parse(JSON.stringify(this.state.user))
    user.name = nickName
    this.setState({
      user: user
    })
  }
  hide = v => {
    // hide means if to hide the main content or not
    let loading = this.refs.loading,
      logged = this.state.logged
    if (v) {
      // loading , need to show the loading div
      logged && loading && loading.classList.remove('hide')
    } else {
      // add 'hide' to not display loading
      loading && loading.classList.add('hide')
    }
  }
  render() {
    const { logged } = this.state
    //const main = (<Route render={(props) => (<Main user={user} {...props} />)}  />)

    const log = <Log login={this.login} />
    const main = <Main logout={this.logout} hide={this.hide} />

    const component = logged ? main : log

    return (
      <div className="home">
        <div className="pageLoading hide" ref="loading">
          加载中...
        </div>
        <Switch>
          <Route render={() => component} />
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  user: state.setUserInfo
})

export default withRouter(
  connect(mapStateToProps, {
    setUserInfo
  })(App)
)
