require("dotenv").config();
const express = require('express');
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

// MIDDLEWARES
const app = express();

app.use(express.static("dist"));

app.use(express.json()); //Without this (json-parser), the propery "body" of the object would be undefined.
// json-parser: tooks the JSON data of the request, converts it to JS and then adds it to the body property of the requested body.

app.use(morgan(function(tokens, req, res) {
    const body = JSON.stringify(req.body);
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      body
    ].join(' ');
  })
);

app.use(cors());

//DATA
// let people = [
//   { 
//     "id": 1,
//     "name": "Arto Hellas", 
//     "number": "040-123456"
//   },
//   { 
//     "id": 2,
//     "name": "Ada Lovelace", 
//     "number": "39-44-5323523"
//   },
//   { 
//     "id": 3,
//     "name": "Dan Abramov", 
//     "number": "12-43-234345"
//   },
//   { 
//     "id": 4,
//     "name": "Mary Poppendieck", 
//     "number": "39-23-6423122"
//   }
// ];

//URLS
app.get('/info', async (req, res) => {
  const count = await Person.countDocuments();
  res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
});

app.get('/api/people', (req, res) => {
  Person.find({}).then(people => {
    res.json(people);
  });
});

app.get("/api/people/:id", (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person);
    } else{
      res.status(404).end();
    }
  })
  .catch(error => next(error));
});

app.delete("/api/people/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch(error => next(error));
});

app.post("/api/people", async (req, res, next) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number are missing" });
  }

  const existingPerson = await Person.findOne({ name: body.name });

  if (existingPerson) {
    return res.status(409).json({ error: "name must be unique" });
  }

  const person = new Person({
    name: body.name,
    number: body.number || 0,
  });

  await person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error));
});

app.put('/api/people/:id', (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: "query" }) //new: true => called with the new person values
    .then(updatedPerson => {
      res.json(updatedPerson);
    })
    .catch(error => next(error));
});

// const generateId = () => {
//   // const maxId = people.length > 0 ? Math.max(...people.map(p => p.id)) : 0; //Using spread operator to create a new array only with the IDs
//   // return maxId + 1;
//   const id = Math.floor(Math.random() * 101);
//   return id;
// };

//Unknown endpoint request middleware

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
};
app.use(unknownEndpoint)

//Requests with in an error
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })

  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler);

//PORT and CONNECTION MSG
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});