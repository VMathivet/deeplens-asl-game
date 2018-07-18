const express = require('express')
const fs = require('fs')
// Create express router
const router = express.Router()
// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
var app = express()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// Add POST - /api/score
router.post('/score', (req, res) => {
  return new Promise((resolve, reject) => {
    if ((req.body.nickname !== null && req.body.nickname !== 'undefined') && (req.body.score !== null && req.body.score !== 'undefined')) {
      var pathFile = './static/asl_scores/scores.json'
      var jsonScores = fs.readFileSync(pathFile)
      jsonScores = JSON.parse(jsonScores)
      if (req.body.scoreToBeDeleted !== null && req.body.scoreToBeDeleted !== 'undefined') {
        delete jsonScores[req.body.scoreToBeDeleted]
      }
      jsonScores.push({
        'id': req.body.nickname,
        'score': req.body.score
      })
      fs.writeFileSync(pathFile, JSON.stringify(jsonScores).replace('null,', ''))
      return resolve()
    }
    return reject()
  })
})

// Export the server middleware
module.exports = {
  path: '/api',
  handler: router
}
