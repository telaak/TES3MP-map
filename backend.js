const http = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(express.json());

let port = 5000
let host = '127.0.0.1'
let locations = []
let players = []

app.post('/players/', (req, res) => {
  let post = req.body
  if (post.hasOwnProperty('login')) {
    delete post.login.password
    delete post.ipAddresses
    let index = players.findIndex(user => user.login.name === post.login.name)
    if (index === -1) {
      players.push(post)
    } else {
      players[index] = post
    }
  }
  res.status(200).send()
})

app.post('/players/locations/', (req, res) => {
  let post = req.body
  let index = locations.findIndex(user => user.name === post.name)
  if (index === -1) {
    locations.push(post)
  } else {
    locations[index] = post
  }
  res.status(200).send()
})

app.get('/players/locations/', (req, res) => {
  res.send(locations)
})

app.get('/players/locations/:name/', (req, res) => {
  res.send(locations.find(user => user.name === req.params.name))
})

app.get('/players/', (req, res) => {
  res.send(players)
})

app.get('/players/:name/', (req, res) => {
  res.send(players.find(user => user.login.name === req.params.name))
})

server.listen(port, host)
console.log('Listening at http://' + host + ':' + port)
