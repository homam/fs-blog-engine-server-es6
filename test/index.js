import assert from 'assert'
import fs from 'fs'
import {promises} from 'async-ls'
const {fromErrorValueCallback, bindP, returnP} = promises
import engineCreator from '../blog-engine/fs-blog-engine'

const wait = (ms) => new Promise(resolve => {
    setTimeout(_ => resolve(), ms)
})

const fileName = './test/store.json'
const newEngine = _ => engineCreator(fileName)

// more tests needed

describe('fs-json-storage', _ => {
    beforeEach(() =>
        fromErrorValueCallback(fs.writeFile)(fileName, '[]', 'utf8')
    )

    const add = (store, title = 'first-post') =>
        store.add({title: title, author: 'homam',  header: 'header', body: 'body'})

    specify('a fresh dataset must be empty', () => {
        newEngine().allPosts().then(posts => 
            assert(posts.length == 0, 'dataset must be empty')
        )
    })

    specify('adding a post to the dataset must change the size of the dataset', () => {
        const store = newEngine()
        return add(store)
            .then(post => assert(!!post._id, 'newly added post is missing an _id field'))
            .then(_ => store.allPosts())
            .then(posts => assert(posts.length == 1, 'dataset must only have 1 post'))
    })

    specify('getting a post from the dataset by _id', () => {
        const store = newEngine()
        return add(store)
            .then(post =>
                store.get(post._id).then(npost => {
                    assert(!!npost, 'newly added post was not found in the dataset')
                    assert(npost._id == post._id, `get failed to retrieve a post with the expected _id of ${post._id} \n${JSON.stringify(npost)}`)
                })
            )
    })

    specify('updating a post', () => {
        const store = newEngine()
        return add(store).then(post => {
            post.body = 'updated body'
            return store.update(post).then(_ =>
                store.get(post._id).then(updatedPost => {
                    assert(!!updatedPost, `newly updated post was not found in the dataset: \n${JSON.stringify(post)}`)
                })
            )
        })
    })

    specify('updating a post must maintain its index', () => {
        const store = newEngine()
        return add(store)
        .then(_ => wait(20))
            .then(_ => add(store))
            .then(post2 => wait(20).then(_ => post2))
            .then(post2 => add(store).then(_ => post2))
            .then(post2 => {
                post2.body = 'updated body'
                return store.update(post2)
            })
            .then(_ => store.allPosts())
            .then(posts => {
                assert(posts[1].body == 'updated body', `posts order changed after an update, second item must have been updated\n${JSON.stringify(posts, null, 2)}`)
            })
    })

    specify('deleting a post', () => {
        const store = newEngine()
        return add(store)
            .then(post => store.remove(post._id).then(deletedPost => {
                assert(deletedPost._id == post._id, 'deleted post _id is not correct')
                return store.allPosts().then(posts => {
                    assert(posts.length == 0, 'dataset must be empty')
                })
            }))
    })


})