const core = require('@actions/core')
const toml = require('toml')
const fs = require('fs')
const path = require('path')

async function run () {
  try {
    const tomlString = fs.readFileSync(path.join(__dirname, 'info.toml'))
    const tomlObject = toml.parse(tomlString)
    const { exercises } = tomlObject

    const exercisesStatus = ['| Name | Status |', '|---|---|']

    for (const exercise of exercises) {
      const rustSource = fs.readFileSync(path.join(__dirname, exercise.path))

      if (rustSource.match('// I AM NOT DONE')) {
        exercisesStatus.push(`| ${exercise.name} | :x: |`)
      } else {
        exercisesStatus.push(`| ${exercise.name} | :white_check_mark: |`)
      }
    }

    const markdownTableText = exercisesStatus.join('\n')

    core.info(markdownTableText)
  } catch (e) {
    core.setFailed(e.message)
  }
}

run()
