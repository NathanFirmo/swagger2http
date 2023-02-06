const fs = require('fs')
const httpCodeGen = require('./http-code-gen')

async function main() {
  const icvRoot = '/home/nathan/Trabalho/Workspace/incentive-me'
  const apisPath = '/apps/api'

  const apis = await fs.promises.readdir(icvRoot + apisPath)
  const apisWithOpenApiSpec = apis.filter((api) =>
    fs.existsSync(icvRoot + apisPath + `/${api}/swagger.json`)
  )

  let currentMapping = JSON.parse(
    (
      await fs.promises.readFile(
        '/home/nathan/Projetos/swagger2http/portsMapping.json'
      )
    ).toString()
  )
  const portsMapping = Object.fromEntries(
    apisWithOpenApiSpec.map((api) => {
      if (Object.keys(currentMapping).includes(api)) {
        return Object.entries(currentMapping).find((item) => item[0] === api)
      }
      return [api, 'http://localhost:8080']
    })
  )

  await fs.promises.writeFile(
    '/home/nathan/Projetos/swagger2http/portsMapping.json',
    JSON.stringify(portsMapping, null, 2)
  )

  for (const api of apisWithOpenApiSpec) {
    const swaggerFile = await fs.promises.readFile(
      icvRoot + apisPath + `/${api}/swagger.json`
    )
    const swagger = JSON.parse(swaggerFile.toString())

    await httpCodeGen({
      swagger,
      api,
      host: portsMapping[api],
    })
  }
}

main()
