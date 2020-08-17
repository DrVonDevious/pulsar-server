const express = require("express")
const passport = require("passport")
const app = express()
const bodyParser = require("body-parser")
const auth = require("./auth.js")()
const db = require("./db.js")
const server = require("http").Server(app)
const io = require("socket.io")(server, {})

const port = process.env.PORT || 3000
let ticksSinceStart = 0

app.use(bodyParser.json())

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.send('Server Running!')
})

app.get("/users", db.getUsers)
app.get("/users/:id", db.getUserById)
app.post("/users", db.createUser)
app.put("/users/:id", db.updateUser)
app.delete("/users/:id", db.deleteUser)

app.get("/characters", db.getCharacters)
app.get("/characters/:id", db.getCharacterById)
app.post("/characters", db.createCharacter)
app.put("/characters/:id", db.updateCharacter)

app.get("/locations", db.getLocations)
app.get("/locations/:id", db.getLocationById)
app.post("/locations", db.createLocation)
app.put("/locations/:id", db.updateLocation)
app.delete("/locations/:id", db.deleteLocation)

io.on("connection", (socket) => {
  console.log("User connected!")

  socket.on("message", (data) => {
    console.log(`${data.sender} sent a message`)
    let sender = data.sender
    let msg = data.msg
    io.sockets.emit('message', { sender, msg })
  })

  socket.on("player-update", (data) => {
    let player = data.player
    socket.broadcast.emit("player-update", { player:player })
  })
})

const tick = () => {
  ticksSinceStart++
  io.emit("tick", { totalTicks:ticksSinceStart })
}

const run = () => {
  setInterval(tick, 500)

  server.listen(port, () => {
    console.log(`All systems nominal! Pulsar server running on port ${port}.`)
  })
}

run()


