import { readFile } from 'node:fs/promises'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

export default class SpaFallbackMiddleware {
  #cachedIndex?: string

  async handle({ request, response }: HttpContext, next: NextFn) {
    await next()

    if (
      response.getStatus() !== 404 ||
      request.method() !== 'GET' ||
      request.url().startsWith('/api/') ||
      !request.accepts(['html'])
    ) return

    this.#cachedIndex ??= await readFile(app.publicPath('index.html'), 'utf8')
    response.status(200).header('content-type', 'text/html; charset=utf-8').send(this.#cachedIndex)
  }
}
