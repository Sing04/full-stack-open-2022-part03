const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req, res), ''
    ].join(' ')
  }))

morgan.token('body', function(req, res){
    if(req.body['name']){
        return JSON.stringify(req.body)
    }
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
              } else {
                response.status(404).end()
              }
            })
            .catch(error => next(error))
})

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]



app.get('/api/info', (request, response) => {
    const date = new Date()
    response.send(`<div> <p>Phonebook has info for ${persons.length} people</p> <p>${date}</p> </div>`)
})


app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(body.name === '' && body.number === '') {
        return response.status(400).json({
            error: 'Error: person name and number missing'
        })
    } else if (body.name === '') {
        return response.status(400).json({
            error: 'Error: person name missing'
        })
    } else if (body.number === '') {
        return response.status(400).json({
            error: 'Error: person number missing'
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'Error: name already exists in phonebook. Name must be unique'
        })
    }
    
    const person = new Person ({
        name: body.name,
        number: body.number
    })
    
    person.save().then(savedPerson =>{
        response.json(savedPerson)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    Person.findByIdAndUpdate(request.params.id, {"number": body.number}, {new: true})
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
            .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// Error handler middleware
const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === "CastError") {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})