/* eslint-disable no-undef */

import React from 'react'
import { shallow } from 'enzyme'
import Mine from './mine'

describe('App', () => {
  let wrapper = shallow(<Mine />)

  it('text of element p in <Mine /> should be Mine', () => {
    expect(wrapper.find('p').text()).toEqual('Mine')
  })
})
