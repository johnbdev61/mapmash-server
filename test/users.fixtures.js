/* eslint-disable semi */

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'John117',
      password: 'secret',
    },
    {
      id: 2,
      username: 'Agent47',
      password: 'secret',
    },
  ]
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 666,
    username: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedUser = {
    ...maliciousUser,
    username:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousUser,
    expectedUser,
  }
}

module.exports = { makeUsersArray, makeMaliciousUser }
