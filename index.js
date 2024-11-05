const express = require('express');
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(express.json()); //Without this (json-parser), the propery "body" of the object would be undefined.
// json-parser: tooks the JSON data of the request, converts it to JS and then adds it to the body property of the requested body.

app.use(express.static("dist"));

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

let people = [
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
];

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${people.length} people</p><p>${new Date()}</p>`)
});

app.get('/api/people', (request, response) => {
  response.json(people)
});

app.get("/api/people/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = people.find(person => person.id === id);
  if (person) res.json(person); else res.status(404).end();
});

app.delete("/api/people/:id", (req, res) => {
  const id = Number(req.params.id)
  people = people.filter(person => person.id !== id);
  res.status(204).end();
});

const generateId = () => {
  // const maxId = people.length > 0 ? Math.max(...people.map(p => p.id)) : 0; //Using spread operator to create a new array only with the IDs
  // return maxId + 1;
  const id = Math.floor(Math.random() * 101);
  return id;
};

app.post("/api/people", (req, res) => {
  const body = req.body;
  console.log("estoy en el post de node")

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "name or number are missing" });
  }

  const existingPerson = people.find(p => p.name === body.name);

  if (existingPerson) {
    return res.status(409).json({ error: "name must be unique" });
  }

  const person = {
    name: body.name,
    number: body.number || 0,
    id: generateId(),
  }
  people = people.concat(person);

  res.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
};
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});