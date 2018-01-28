/* eslint-disable no-undef */

import React from 'react'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Mine from './mine'

configure({ adapter: new Adapter() })

describe('App', () => {
  let wrapper = shallow(<Mine />)

  it('initializes `selectedFoods` to a blank array', () => {
    expect(wrapper.state().selectedFoods).toEqual([])
  })
})
