import fs from 'fs'
import {find} from 'prelude-ls'
import {promises} from 'async-ls'
const {fromErrorValueCallback, bindP, returnP} = promises

export default (fileName) => {

    const allPosts = _ => 
        fromErrorValueCallback(fs.readFile)(fileName, {encoding: 'utf8'}).then(content =>
            content.length == 0 ? [] : JSON.parse(content)
        )

    const save = (posts) =>
        fromErrorValueCallback(fs.writeFile)(fileName, JSON.stringify(posts, null, 4), 'utf8')


    const get = (_id) =>
        allPosts().then(posts => find(p => p._id == _id, posts))

    const add = (post) => {
        const now = new Date().valueOf()
        post._id = now
        post._dateCreated = now
        post._dateLastModified = now
        return allPosts()
            .then(posts => {
                posts.push(post)
                return save(posts)
            })
            .then(_ => post)
    }

    return {
        allPosts: allPosts,
        add: add,
        get: get
    }
}