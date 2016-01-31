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


export default ({onChange}) => {

    const propagateChange = (f) =>
        f.then(r => {
            setImmediate(_ =>
                service.all().then(onChange)
            )
            return r
        })

    return [
        makeRoute('get', '/api/all', service.all), 
        makeRoute('get', '/api/get/:postid', req =>
            service.get(parseInt(req.params.postid))
        ),
        makeRoute('post', '/api/new', req =>
            propagateChange(service.add(req.body))
        ),
        makeRoute('post', '/api/update', req =>
            propagateChange(service.update(req.body))
        ),
        makeRoute('post', '/api/delete/:postid', req =>
            propagateChange(service.remove(parseInt(req.params.postid)))
        ),
        makeRoute('post', '/api/restore', req =>
            propagateChange(service.restore(req.body))
        )
    ]
}