const fs = require('fs')

const swaggerToHttp = async ({ swagger, api = 'auto_generated', host }) => {
  const workspaceRoot = process.cwd()

  for (const [path, pathData] of Object.entries(swagger.paths)) {
    for (const [method, methodData] of Object.entries(pathData)) {
      let fileData = ''
      fileData += `# ${methodData.description}\n\n`
      fileData += `${String(method).toUpperCase()} ${host}${path}`

      const refPath =
        methodData.requestBody?.content?.['application/json']?.schema?.$ref
      if (refPath) {
        const [_, componentsName, schemaName, dtoName] = String(refPath).split(
          '/'
        )
        const dto = swagger[componentsName][schemaName][dtoName]
        const payload = resolvePayload(dto, swagger)

        fileData += '\nContent-Type: application/json'
        fileData += '\n\n' + JSON.stringify(payload, null, 2)
      }

      const fileName = removeSlash(
        `${path}.${String(method).toUpperCase()}.http`
      )

      if (!fs.existsSync(`${workspaceRoot}/http_requests/${api}`)) {
        await fs.promises.mkdir(`${workspaceRoot}/http_requests/${api}`, {
          recursive: true,
        })
      }

      await fs.promises.writeFile(
        `${workspaceRoot}/http_requests/${api}/${fileName}`,
        fileData
      )
    }
  }
}

const removeSlash = (value) => String(value).replace(/\//g, '⧸')

const resolvePayload = (dto, swagger) => {
  let payload
  if (dto.type === 'object') {
    payload = {}
    for (const [prop, definition] of Object.entries(dto.properties)) {
      if (definition?.type === 'object' || !!definition.$ref) {
        const refPath = definition.$ref
        if (refPath) {
          const [_, componentsName, schemaName, dtoName] = String(
            refPath
          ).split('/')
          const dto = swagger[componentsName][schemaName][dtoName]
          payload[prop] = resolvePayload(dto, swagger)
        }
      } else if (definition?.type === 'array') {
        const refPath = definition?.items?.$ref
        if (refPath) {
          const [_, componentsName, schemaName, dtoName] = String(
            refPath
          ).split('/')
          const dto = swagger[componentsName][schemaName][dtoName]
          payload[prop] = [resolvePayload(dto, swagger)]
        }
      } else payload[prop] = definition?.type
    }
  } else {
    payload = dto.type
  }

  return payload
}

module.exports = swaggerToHttp
