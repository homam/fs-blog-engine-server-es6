import {find} from 'prelude-ls'
import {promises} from 'async-ls'
const {fromErrorValueCallback} = promises

export default (store) => {
    
    const validate = (blog) => new Promise((resolve, reject) => {
        const missingProp = find(p => !blog[p], ["title", "header", "body"])
        if (!!missingProp) {
            return reject(`${missingProp} cannot be empty`)
        } else {
            return resolve(blog)
        }
      })
    
    return {
        add: (blog) => validate(blog).then(_ => store.add(blog))
        
        , 
        get: (_id) => store.get(_id).then(post => {
            if (!post) {
                return Promise.reject(`No post was found for the given ID: ${_id}`)
            } else {
                return Promise.resolve(post)
            }
        })

        ,
        update: (blog) => validate(blog).then(_ => store.update(blog))
        
        ,
        remove: (_id) => store.remove(_id)

        ,
        restore: (blog) => store.insert(blog)

        ,
        all: store.allPosts
    }  
}  