const getUnselectData = (unselectData = []) => {
  return Object.fromEntries(unselectData.map(data => [data, 0]))
}

export default getUnselectData