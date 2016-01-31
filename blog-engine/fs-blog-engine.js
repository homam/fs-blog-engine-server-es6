import fs from 'fs'
import {find, findIndex, partition, reverse} from 'prelude-ls'
import merge from 'merge'
import {promises} from 'async-ls'
const {fromErrorValueCallback} = promises

export default (fileName) => {

    // allPosts ::  _ => [Post]
    const allPosts = _ => 
        fromErrorValueCallback(fs.readFile)(fileName, {encoding: 'utf8'}).then(content =>
            // content :: String, file content
            content.length == 0 ? [] : JSON.parse(content)
        )

    // save  :: [Post] -> IO ()
    const save = (posts) =>
        fromErrorValueCallback(fs.writeFile)(fileName, JSON.stringify(posts, null, 4), 'utf8')


    // get :: _id => Promise Post
    const get = (_id) =>
        allPosts().then(posts => find(p => p._id == _id, posts))

    // add :: Post -> Promise Post
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

    // update :: Post -> Promise Post
    const update = (post) =>
        allPosts().then(posts => {
            const index = findIndex(p => p._id == post._id, posts)
            if ('undefined' == typeof(index)) {
                return Promise.reject(`No Post was found for the given _id: ${post._id} (update)`)
            } else {
                const oldPost = posts[index]
                const updatedPost = merge(oldPost, post)
                posts[index] = updatedPost
                return save(posts).then(_ => updatedPost)
            }
        })

    const remove = (_id) => 
        allPosts().then(posts => {
            const index = findIndex(p => p._id == _id, posts)
            if ('undefined' == typeof(index)) {
                return Promise.reject(`No Post was found for the given _id: ${_id} (remove)`)
            } else {
                const oldPost = posts[index]
                posts = posts.slice(0, index).concat(posts.slice(index + 1))
                return save(posts).then(_ => oldPost)
            }
        })

    const insert = (post) =>
        get(post._id).then(oldPost => {
            if(!!oldPost) {
                Promise.reject(`A Post with the same _id already exists. _id: ${post._id} (insert)`)
            } else {
                return allPosts().then(posts => {
                    let [before, after] = partition(p => p._id < post._id, posts)
                    before.push(post)
                    return save(before.concat(after)).then(_ => post)
                })
            }
        })

    return {
        allPosts: allPosts,
        add: add,
        get: get,
        update,
        remove,
        insert,

        // posts are save in chronological order
        allPosts: _ => allPosts().then(reverse)
    }
}