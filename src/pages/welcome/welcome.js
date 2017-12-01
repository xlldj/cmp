import React from 'react'
//import Form from 'antd/lib/form'
import homePic from '../assets/homePic.jpg'
import './style/style.css'
import {setLocal} from '../util/storage'
import AjaxHandler from '../ajax'

class Welcome extends React.Component{
  state = {
  }
  componentDidMount () {
    this.props.hide(false)
    // this.setDefaultSchool()
  }
  setDefaultSchool = () => {
    let url = '/school/list'
    const body = {
      page: 1,
      size: 1
    }
    const cb = (json) => {
      if (json.data) {
        let school = json.data.schools && json.data.schools[0]
        let {id} = school
        if (id) {
          setLocal('defaultSchool', id)
        }
      }
    }
    AjaxHandler.ajax(url, body, cb) 
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  render(){
    return (
      <div>
        <div className='breadc'>
        </div>

        <div className='disp'>
          <div className='welcomeWrapper'>
            <img src={homePic} alt='Welcome' className='welcomeImg' />
          </div>
        </div>
      </div>
    )    
  }
}

export default Welcome