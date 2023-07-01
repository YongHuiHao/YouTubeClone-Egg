'use strict'

const { Controller } = require('egg')

class VodController extends Controller {
  async createUploadVideo() {
    const { ctx } = this
    const { query } = ctx

    ctx.validate(
      {
        Title: { type: 'string' },
        FileName: { type: 'string' }
      },
      query
    )

    ctx.body = await this.app.vodClient.request('CreateUploadVideo', query, {})
  }

  async refreshUploadVideo() {
    const { ctx } = this
    const { query } = ctx

    ctx.validate(
      {
        Title: { type: 'string' },
        FileName: { type: 'string' }
      },
      query
    )

    ctx.body = await this.app.vodClient.request('CreateUploadVideo', query, {})
  }
}

module.exports = VodController
