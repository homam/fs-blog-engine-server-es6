import http from 'http'
import bodyParser from 'body-parser'
import {each} from 'prelude-ls'
import express from 'express'
import IO from 'socket.io'
import routes from './routes'
const port = !!process.env.PORT ? process.env.PORT : 3001

const app = express()
.use(bodyParser.json())
.use(bodyParser.urlencoded({extended: false}))
.use((req, res, next) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    if(!!req.headers['Access-Control-Request-Headers'.toLowerCase()]) {
        res.set('Access-Control-Allow-Headers', req.headers['Access-Control-Request-Headers'.toLowerCase()])
    }
    if('OPTIONS' == req.method){
        res.end('')
    } else {
        next()
    }
})


const server = http.createServer(app)
const io = IO(server)

each(([_, verb, path, f]) => app[verb](path, f), routes({
    onChange: posts => {
        // this callback is called every time a post created / updated / deleted
        // emit the change to all clients
        io.emit('all-posts', posts)
    }
}))



server.listen(port)
console.log(`Server running at http://127.0.0.1:${port}/`);