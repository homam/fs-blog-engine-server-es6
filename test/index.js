import assert from 'assert'
import fs from 'fs'
import {promises} from 'async-ls'
const {fromErrorValueCallback, bindP, returnP} = promises
import engineCreator from '../blog-engine/fs-blog-engine'

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

})