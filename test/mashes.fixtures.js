/* eslint-disable semi */
function makeMashesArray() {
  return [
    {
      id: 1,
      game_title: 'Superman 64',
      notes: 'These notes are for Superman 64',
      date_modified: new Date().toISOString(),
    },
    {
      id: 2,
      game_title: 'Friday the 13th',
      notes: 'These notes are for Friday the 13th',
      date_modified: new Date().toISOString(),
    },
    {
      id: 3,
      game_title: 'Shaq Fu',
      notes: 'These notes are for Shaq Fu',
      date_modified: new Date().toISOString(),
    },
  ]
}

function makeMaliciousMash() {
  const maliciousMash = {
    id: 666,
    game_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    notes: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date_modified: new Date().toISOString(),
  }
  const expectedMash = {
    ...maliciousMash,
    game_title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    notes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousMash,
    expectedMash,
  }
}

module.exports = { makeMashesArray, makeMaliciousMash }
