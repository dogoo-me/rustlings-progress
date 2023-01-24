const core = require('@actions/core')
const github = require('@actions/github')
const toml = require('toml')
const fs = require('fs')
const path = require('path')

const MD_START_SIGN = '<!-- RUST PROGRESS START -->'
const MD_END_SIGN = '<!-- RUST PROGRESS END -->'

async function run () {
  try {
    core.info('read info.toml')
    const tomlString = fs.readFileSync(path.join(process.env.GITHUB_WORKSPACE, 'info.toml'))

    core.info('parse info.toml')
    const tomlObject = toml.parse(tomlString)
    const { exercises } = tomlObject

    const exercisesStatus = [MD_START_SIGN, '| Name | Status |', '|---|---|']

    core.info('check exercises done')
    for (const exercise of exercises) {
      const rustSource = fs.readFileSync(path.join(process.env.GITHUB_WORKSPACE, exercise.path)).toString()

      if (rustSource.match('// I AM NOT DONE')) {
        exercisesStatus.push(`| ${exercise.name} | :x: |`)
      } else {
        exercisesStatus.push(`| ${exercise.name} | :white_check_mark: |`)
      }
    }
    exercisesStatus.push(MD_END_SIGN)

    core.info('join markdown text')
    const markdownTableText = exercisesStatus.join('\n')

    core.info('find README.md')
    const contents = fs.readdirSync(process.env.GITHUB_WORKSPACE)
    const readme = contents.find((content) => content.match(/(markdown|MARKDOWN)\.(md|MD)/))

    core.info('create octokit client')
    const token = core.getInput('github_token')
    const octokit = github.getOctokit(token)
    let markdownContent = ''

    core.info('update readme')
    if (readme) {
      let { content } = await octokit.rest.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: readme
      })

      content = content || ''

      if (content.includes(MD_START_SIGN) && content.includes(MD_END_SIGN)) {
        const from = content.indexOf(MD_START_SIGN)
        const to = content.indexOf(MD_END_SIGN) + MD_END_SIGN.length
        const upperContent = content.substring(0, from)
        const lowerContent = content.substring(to)
        markdownContent = `${upperContent}${markdownTableText}${lowerContent}`
      }
    } else {
      core.info('no readme.md found')
      markdownContent = `${markdownTableText}`
    }

    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      path: readme,
      message: 'update readme with rustlings progress',
      content: markdownContent
    })

    if (result.status < 300) {
      core.info(`update readme successfully with status code ${result.status}`)
    } else {
      core.setFailed(`update readme failed with status code ${result.status}`)
    }
  } catch (e) {
    core.setFailed(e.message)
  }
}

run()
