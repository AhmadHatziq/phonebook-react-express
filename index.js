const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const dotenv = require('dotenv').config()
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

// Register a custom token to display the data sent in HTTP POST requests 
// morgan.token('type', function (req, res) { return req.headers['content-type'] })
morgan.token('posted_data', logJsonPost = (req, res)  => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
})
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :posted_data '))

// Hardcoded data. 
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456", 
      "toShow": true
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523", 
      "toShow": true
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345", 
      "toShow": true
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122", 
      "toShow": true
    }
]

// Query the schema for all Person objects, transform it and send it to the front-end. 
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id

    // Query the Person model for the ID and return the person json 
    Person.findById(id)
      .then(person => {
        response.json(person)
      })
      .catch(error => {
        response.status(404).end()
      })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)

    // Filter and remove the matching id 
    persons = persons.filter(person => person.id !== id)
  
    // Send status 204. 
    response.status(204).end()

    // Check that persons had deleted the person. 
    //console.log(persons)

  })

  // Generate a random ID from the largest current ID to positive infinity 
  const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => p.id))
      : 0
    const randomId = maxId + 1 + Math.floor(Math.random() * 10000)
    return randomId
  }

  // Add a new person when a POST request is made. 
  app.post('/api/persons', (request, response) => {
    const body = request.body 

    // Check if there is missing name 
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    }

    // Checks if there is missing number 
    if (!body.number) {
        return response.status(400).json({ 
            error: 'number missing' 
          })
    }

    // Checks if the name already exists. 
    const exists = persons.some(obj => obj.name === body.name); 
    if (exists) {
        return response.status(400).json({ 
            error: 'name must be unique' 
          })
    }
    
    // Create a new person object
    const newPerson = {
        id: generateId(), 
        name: body.name, 
        number: body.number 
    }

    // Append to the persons array
    persons = persons.concat(newPerson)

    // Return the newly created person 
    response.json(newPerson)

    // Print the current persons array 
    // console.log(persons)
  })

// Returns the total number of people in the phonebook and time of request. 
app.get('/info', (request, response) => {
    const currentDateTime = new Date() 
    const responseHtml = `
        <p>Phonebook has info for ${persons.length} people</p>
        <p> ${currentDateTime.toString()}  </p>
    `
    response.send(responseHtml)
})

// Make the server listen on port 3001 or the environment variable (for deployment)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})