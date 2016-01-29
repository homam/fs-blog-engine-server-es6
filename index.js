import http from 'http'
import bodyParser from 'body-parser'
import {each} from 'prelude-ls'
import express from 'express'
import engineCreator from './blog-engine/fs-blog-engine'
import servieCreator from './blog-engine/service'

const engine = engineCreator('./store.json')
const service = servieCreator(engine)


const apiCall = (res, route, f) =>
    f()
    .then(it => res.send(it))
    .catch(it => {
        console.error(route, it);
        return res.status(500).send({
            error: true,
            errorContext: it.toString()
        })
    })

const makeRoute = (verb, path, f) =>
    [
        path, 
        verb, 
        path, 
        (req, res) => apiCall(res, path, _ => f(req))
    ]


const app = express()
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: false}))

const routes = [
    makeRoute('get', '/api/all', service.all), 
    makeRoute('get', '/api/get/:postid', function(req){
        return service.get(parseInt(req.params.postid));
    })
]
each(route => app[route[1]].apply(app, route.slice(2)), routes)

const server = http.createServer(app)
const port = 3001

server.listen(port)
console.log(`Server running at http://127.0.0.1:${port}/`);