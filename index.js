const core = require('@actions/core')
const toml = require('toml')
const fs = require('fs')

async function run() {
  try {
    const tomlString = fs.readFileSync('info.toml')
    const tomlObject = toml.parse(tomlString)
    const {exercises} = tomlObject

    let exercisesStatus = ['| Name | Status |', '|---|---|']

    for(const exercise of exercises){
      const rustSource = fs.readFileSync(exercise.path)

      if(rustSource.match("// I AM NOT DONE")){
        exercisesStatus.push(`| ${exercise.name} | :x: |`)
      }else {
        exercisesStatus.push(`| ${exercise.name} | :white_check_mark: |`)
      }
    }

    const markdownTableText = exercisesStatus.join('\n')

    core.info(markdownTableText)
  }catch(e){
    core.setFailed(e.message)
  }
}

run()