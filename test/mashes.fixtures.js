/* eslint-disable semi */
function makeMashesArray() {
  return [
    {
      id: 1,
      game_title: 'Superman 64',
      notes: 'These notes are for Superman 64',
      date_modified: new Date().toISOString(),
      author_id: 1,
    },
    {
      id: 2,
      game_title: 'Friday the 13th',
      notes: 'These notes are for Friday the 13th',
      date_modified: new Date().toISOString(),
      author_id: 1,
    },
    {
      id: 3,
      game_title: 'Shaq Fu',
      notes: 'These notes are for Shaq Fu',
      date_modified: new Date().toISOString(),
      author_id: 1,
    },
  ]
}

function makeVotesArray() {
  return [
    {
      is_upvote: true,
      mashes_id: 1,
      users_id: 1,
    },
    {
      is_upvote: true,
      mashes_id: 2,
      users_id: 2,
    },
    {
      is_upvote: true,
      mashes_id: 3,
      users_id: 3,
    },
  ]
}

function makeBindsArray() {
  return [
    {
      id: 2,
      mash_id: 2,
      key_input: 'Y Button',
      key_action: 'Switch Weapon',
    },
    {
      id: 3,
      mash_id: 2,
      key_input: 'X Button',
      key_action: 'Reload',
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

module.exports = {
  makeMashesArray,
  makeVotesArray,
  makeBindsArray,
  makeMaliciousMash,
}
