/* eslint-disable semi */
function makeBindsArray() {
  return [
    {
      id: 1,
      mash_id: 1,
      key_input: 'Y Button',
      key_action: 'Switch Weapon',
    },
    {
      id: 2,
      mash_id: 2,
      key_input: 'X Button',
      key_action: 'Reload',
    },
    {
      id: 3,
      mash_id: 3,
      key_input: 'A Button',
      key_action: 'Jump',
    },
  ]
}

function makeMaliciousBind() {
  const maliciousBind = {
    id: 666,
    key_input: 'A Button',
    key_action: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedBind = {
    ...maliciousBind,
    key_action: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousBind,
    expectedBind,
  }
}

module.exports = { makeBindsArray, makeMaliciousBind }
