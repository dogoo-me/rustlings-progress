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
    core.startGroup('joined table content')
    core.info(markdownTableText)
    core.endGroup()

    core.info('find README.md')
    const contents = fs.readdirSync(process.env.GITHUB_WORKSPACE)
    const readme = contents.find((content) => content.match(/(readme|README)\.(md|MD)/))

    core.info('create octokit client')
    const token = core.getInput('github_token')
    const octokit = github.getOctokit(token)
    const payload = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      path: readme || 'README.md',
      message: 'update readme with rustlings progress'
    }

    core.info('update readme')
    if (readme) {
      const { data } = await octokit.rest.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: readme
      })

      let content = Buffer.from(data.content || '', 'base64').toString('utf8')
      core.startGroup('previous content')
      core.info(content)
      core.endGroup()

      if (content.includes(MD_START_SIGN) && content.includes(MD_END_SIGN)) {
        const from = content.indexOf(MD_START_SIGN)
        const to = content.indexOf(MD_END_SIGN) + MD_END_SIGN.length
        const upperContent = content.substring(0, from)
        const lowerContent = content.substring(to)
        content = `${upperContent}${markdownTableText}${lowerContent}`
      }
      payload.content = content
      payload.sha = data.sha
    } else {
      core.info('no readme.md found')
      payload.content = markdownTableText
    }

    core.startGroup('new content')
    core.info(payload.content)
    core.endGroup()

    const result = await octokit.rest.repos.createOrUpdateFileContents(payload)

    if (result.status < 300) {
      core.info(`update readme successfully with status code ${result.status}`)
    } else {
      core.setFailed(`update readme failed with status code ${result.status}`)
    }
    core.startGroup('response')
    core.info(JSON.stringify(result, null, 2))
    core.endGroup()
  } catch (e) {
    core.error(e)
    core.setFailed(e.message)
  }
}

run()
