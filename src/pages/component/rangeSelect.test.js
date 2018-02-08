/* eslint-disable no-undef */

import React from 'react'
import { shallow } from 'enzyme'
import RangeSelect from './rangeSelect'

describe('App', () => {
  let wrapper = shallow(<RangeSelect />)

  wrapper
    .find('.datePicker')
    .children()
    .toEqual(2)
})
