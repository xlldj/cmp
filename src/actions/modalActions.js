export const CHANGE_MODAL_LOST = 'CHANGE_MODAL_LOST'
export const modalActionFactory = (modalName, value) => {
  const type = 'CAHNGE_MODAL_' + modalName.toUpperCase()
  return {
    type,
    value
  }
}
