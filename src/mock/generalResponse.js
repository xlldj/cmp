export const add_success = {
  data: {
    id: 2
  }
}

export const delete_error = {
  data: {
    failReason: '已存在',
    result: false
  },
  displayMessage: 'error'
}

export const delete_ok = {
  data: {
    failReason: '',
    result: true
  }
}
