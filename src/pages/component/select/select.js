import React from 'react'
import arrow from '../../assets/selectArrow.png'

class Select extends React.Component {
  state = {
    searching: false,
    inputLock: false,
    searchText: '',
    inputText: '',
    open: false // show the dropdown or not
  }
  componentWillMount() {
    this.getAllOption()
  }
  componentDidUpdate() {
    let searchInput = this.refs.searchInput
    if (searchInput) {
      searchInput.focus()
    }
  }
  componentWillReceiveProps(nextProps) {}
  getAllOption = () => {
    const handleOption = r => {
      valueLabelPairs[r.props.value] = r.props.children
      values.push(r.props.value)
      return (
        <li
          key={`option-${r.props.value}`}
          className={value === r.props.value ? 'selected' : ''}
          data-value={r.props.value}
        >
          {r.props.children}
        </li>
      )
    }
    const handleOptGroup = (r, i) => {
      let groupChildren = r.props.children
      let optItems = groupChildren.map((rec, ind) => {
        if (rec.props.value) {
          valueLabelPairs[rec.props.value] = rec.props.children
          values.push(rec.props.value)
        }
        return (
          <li
            key={`optGroupOption-${rec.props.value}`}
            className={
              value === rec.props.value
                ? 'selected light-optOption'
                : 'light-optOption'
            }
            data-value={rec.props.value}
          >
            {rec.props.children}
          </li>
        )
      })
      return (
        <div key={`optGroupWrapper${i}`} className="light-optWrapper">
          <div key={`optGroupTitle${i}`} className="light-optTitle">
            <span>{r.props.title}</span>
          </div>
          <ul key={`optGroupUl${i}`}>{optItems}</ul>
        </div>
      )
    }
    let { value, all, children, allTitle } = this.props
    value = value.toString()
    let valueLabelPairs = {},
      values = []
    let childItems = children.map((r, i) => {
      if (!r) {
        return null
      } else if (Array.isArray(r)) {
        let arrayItems = r.map((record, index) => {
          return handleOption(record)
        })
        return arrayItems
      } else {
        if (r.type.isSelectOption) {
          return handleOption(r)
        } else if (r.type.isSelectOptGroup) {
          return handleOptGroup(r, i)
        } else {
          return null
        }
      }
    })
    // '全部选项'的键值对在这里添加到全局的键值对中用于匹配value，而all选项在render中添加
    if (all) {
      valueLabelPairs.all = allTitle
      values.unshift('all')
    }
    this.values = values
    this.valueLabelPairs = valueLabelPairs
    if (values.length === 0) {
      // 没有选项时
      childItems = (
        <li key={`none`} data-value={'none'}>
          无选项
        </li>
      )
    }
    // this.childItems = childItems
    return childItems
  }
  getSearchingOptions = () => {
    let valueLabelPairs = this.valueLabelPairs
    let value = this.props.value.toString()
    let { searchText } = this.state
    let keys = Object.keys(valueLabelPairs)
    let searchResult = keys.filter(r => valueLabelPairs[r].includes(searchText))
    this.searchResult = searchResult
    if (searchResult.length) {
      let childItems = searchResult.map((r, i) => (
        <li
          key={`option-${i}`}
          className={value === r ? 'selected' : ''}
          data-value={r}
        >
          {valueLabelPairs[r]}
        </li>
      ))
      return childItems
    } else {
      return <li className="noSearchResult">无匹配结果</li>
    }
  }
  toggleDropdown = e => {
    let disabled = this.props.disabled
    if (disabled) {
      return
    }
    let nextState = {}
    let { search, value } = this.props
    let { open } = this.state
    if (open && value) {
      nextState.open = false
      nextState.searching = false
      nextState.searchText = ''
      nextState.inputText = ''
    }
    if (!open) {
      nextState.open = true
      if (search) {
        nextState.searching = true
      }
    }
    this.setState(nextState)

    let selectWindow = this.refs.selectWindow
    if (selectWindow && !selectWindow.classList.contains('activeWindow')) {
      selectWindow.classList.add('activeWindow')
    }
  }
  checkFocus = () => {
    if (this.state.open) {
      this.setState({
        open: false,
        searching: false,
        searchText: '',
        inputText: ''
      })
    }
    let selectWindow = this.refs.selectWindow
    if (selectWindow) {
      selectWindow.classList.remove('activeWindow')
    }
    let value = this.props.value.toString()
    if (this.props.onBlur && value !== 'none') {
      this.props.onBlur(value)
    }
  }
  selectBlur = e => {
    // set a timer , if expires, close the select
    /* console.log(e.relatedTarget)
    console.log(e.currentTarget) */
    this.blurTi = setTimeout(this.checkFocus, 25)
  }
  optionClicked = e => {
    if (this.blurTi) {
      clearTimeout(this.blurTi)
      this.blurTi = null
    }
    if (e.target.tagName.toLowerCase() === 'li') {
      let value = e.target.getAttribute('data-value')
      if (value === 'none') {
        // 若选择的是'无选择'项，什么也不做
        return
      }
      this.setState({
        open: false,
        searching: false,
        searchText: '',
        inputText: ''
      })
      if (this.props.onChange) {
        this.props.onChange(value)
      }
    }
  }
  getMixedStyle = () => {
    let { style, width } = this.props
    if (style && width) {
      style.width = width
      return style
    } else if (style) {
      return style
    } else if (width) {
      return {
        width: width
      }
    } else {
      return null
    }
  }
  changeSearch = e => {
    let { inputLock } = this.state,
      nextState = {}
    let v = e.target.value.trim()
    if (inputLock) {
      nextState.inputText = v
    } else {
      nextState.inputText = v
      nextState.searchText = v
    }
    this.setState(nextState)
  }
  handleChineseStart = e => {
    if (this.state.inputLock) {
      return
    }
    this.setState({
      inputLock: true
    })
  }
  handleChineseEnd = e => {
    let v = e.target.value.trim()
    this.setState({
      //onCompositionEnd happens after onChange, so need to set value here.
      inputLock: false,
      inputText: v,
      searchText: v
    })
  }
  pressEnter = e => {
    let key = e.key
    if (key.toLowerCase() === 'enter') {
      this.setSearchResult()
    }
  }
  setSearchResult = () => {
    let searchResult = this.searchResult,
      nextState = {}

    nextState.searching = false
    nextState.searchText = ''
    nextState.inputText = ''
    nextState.open = false

    if (searchResult && searchResult.length) {
      let value = searchResult[0]
      this.props.onChange(value)
    } else {
      this.props.onChange(this.values[0])
    }
    this.setState(nextState)
    this.refs.selectWrapper.focus()
  }
  searchInputFocused = e => {
    if (this.blurTi) {
      clearTimeout(this.blurTi)
      this.blurTi = null
    }
  }
  focusInSelect = ({ relatedTarget, currentTarget }) => {
    if (relatedTarget === null) return false

    var node = relatedTarget,
      selectNode = this.refs.selectWrapper

    while (node !== null) {
      if (node === selectNode) return true
      node = node.parentNode
    }

    return false
  }
  searchInputBlur = e => {
    if (this.focusInSelect(e)) {
      e.stopPropagation()
    }
  }
  handleScroll = e => {
    let dropdown = this.refs.dropdown,
      down = e.deltaY > 0 ? true : false
    let sh = dropdown.scrollHeight,
      ch = dropdown.clientHeight,
      st = dropdown.scrollTop
    if (down && ch + st >= sh - 2) {
      dropdown.scrollTop = sh - ch
      e.preventDefault()
    } else if (!down && st <= 1) {
      dropdown.scrollTop = 0
      e.preventDefault()
    }
  }
  render() {
    let {
      value,
      all,
      allTitle,
      className,
      dropdownClassName,
      dropdownStyle,
      notFoundTitle
    } = this.props
    value = value.toString().trim()
    let { searchText, open, searching, inputText } = this.state
    const style = this.getMixedStyle()
    const searchInput = (
      <input
        id="searchInput"
        ref="searchInput"
        value={inputText}
        onChange={this.changeSearch}
        onCompositionStart={this.handleChineseStart}
        onCompositionEnd={this.handleChineseEnd}
        onFocus={this.searchInputFocused}
        onBlur={this.searchInputBlur}
        onKeyDown={this.pressEnter}
        className="light-searchInput"
      />
    )
    const childItems =
      searching && searchText ? this.getSearchingOptions() : this.getAllOption()
    // 需要确保一定能找到当前的value
    // get current label after get all options , bacause the value label pairs changed there
    let currentLabel =
      this.valueLabelPairs[value] || (open ? '' : notFoundTitle) || '无'
    const currentOption = (
      <div className="light-currentOption" onClick={this.toggleDropdown}>
        <span>{currentLabel}</span>
        <img src={arrow} alt="" />
      </div>
    )
    const popUps = (
      <ul
        className={
          dropdownClassName
            ? dropdownClassName + ' light-selectUl'
            : 'light-selectUl'
        }
        style={dropdownStyle}
        onClick={this.optionClicked}
        onWheel={this.handleScroll}
        ref="dropdown"
      >
        {all && !searchText ? (
          <li
            key={'option-all'}
            className={value === 'all' ? 'selected' : ''}
            data-value={'all'}
          >
            {allTitle}
          </li>
        ) : null}
        {childItems}
      </ul>
    )

    return (
      <div
        style={style}
        className={
          className ? 'light-styleWrapper ' + className : 'light-styleWrapper'
        }
      >
        <div
          className="light-selectWrapper"
          onBlur={this.selectBlur}
          tabIndex={1}
          ref="selectWrapper"
        >
          <div className="selectWindow" id="selectWindow" ref="selectWindow">
            {searching ? searchInput : currentOption}
          </div>

          {open ? popUps : null}
        </div>
      </div>
    )
  }
}

export default Select
