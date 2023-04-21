import express from "express"
import bcrypt from "bcrypt-nodejs"
import cors from "cors"
import knex from "knex";

const pg = knex({
    client: 'pg', connection: {
        host: '127.0.0.1', port: 5432, user: 'postgres', password: 'root', database: 'face-recognition'

    }, searchPath: ['knex', 'public']
});

pg.select().table('users')
    .then(data => console.log(data))


const app = express()


app.use(express.json())
app.use(cors())

const database = {
    users: [{
        id: '1',
        name: 'name1',
        email: 'email1',
        password: '$2a$10$SAlzyuolrvmS7a0N8c3LRuwB1hVdGR98R0wtwCJDZQqSZWNVGkS1i',
        entries: 0,
        joined: new Date()
    }, {
        id: '2',
        name: 'name2',
        email: 'email2',
        password: '$2a$10$LOs26oU5uibaET7PjMsHcOBEeuyZ6F87AUhFeF3OFEvNuVVhGGIm6',
        entries: 0,
        joined: new Date()
    }]

}

app.get('/', (req, res) => {
    res.json(database.users)
})

app.post('/signin', (req, res) => {
    /*bcrypt.compare("password1", '$2a$10$SAlzyuolrvmS7a0N8c3LRuwB1hVdGR98R0wtwCJDZQqSZWNVGkS1i', function(err, res) {
        console.log('1', res)
    });
    bcrypt.compare("veggies", '$2a$10$SAlzyuolrvmS7a0N8c3LRuwB1hVdGR98R0wtwCJDZQqSZWNVGkS1i', function(err, res) {
        console.log('2', res)
    });*/
    const {email, password} = req.body
    let found = false

    database.users.forEach(user => {
        if (user.email === email) {
            if (bcrypt.compareSync(password, user.password)) {
                found = true
                const userInfo = {
                    email, name: user.name, id: user.id, entries: user.entries, joined: user.joined
                }
                return res.json(userInfo)
            } else {
                return res.status(404).json('incorrect password')
            }


        }
    })
    return res.status(404).json('user not found')

    /*if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password)
        res.json('success')*/
})

app.post('/register', (req, res) => {
    const {email, password, name} = req.body

    let hashPassword = bcrypt.hashSync(password);
    console.log(hashPassword)
    const userInfo = {
        email, joined: new Date(), name
    }
    console.log(userInfo)
    pg('users').insert({...userInfo})
        .returning('*')
        .then(user => res.json(user[0]))
        .catch(err => res.status(400).json('bad request'))

})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params
    let found = false
    database.users.forEach(user => {
        if (user.id === id) {
            found = true
            return res.json(user)

        }
    })
    if (!found) {
        res.status(404).json('no such user')
    }
})
app.put('/image', (req, res) => {
    const {id} = req.body
    let found = false
    database.users.forEach(user => {
        if (user.id === id) {
            found = true
            user.entries++
            return res.json(user.entries)

        }
    })
    if (!found) {
        res.status(404).json('no such user')
    }
})

/*app.use(express.urlencoded({extended:false}))
app.use(express.json())


app.get('/', (req, res) => {
    res.send('getting root')
})
app.get('/profile', (req, res) => {
    res.send('getting profile')
})

app.post('/', function (req, res) {
    console.log(req.body)
    res.send({a:'s'})
});*/


app.listen('3000', () => {
    console.log('running success on port 3000')
})