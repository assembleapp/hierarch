var push_upgrades = (address, upgrades) => {
  upgrades.sort((x, y) => x.begin < y.begin ? -1 : 1)

  return fetch(`http://${process.env.REACT_APP_HIERARCH_ADDRESS}/upgrade`, {
    method: "POST",
    body: JSON.stringify({ address, upgrades }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then(() => {
    if(window.assemble && window.assemble.repull)
      window.assemble.repull()
  })
}

export default push_upgrades
