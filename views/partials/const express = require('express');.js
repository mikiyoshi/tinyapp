const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};
//
//  MIDDLEWARE
//

// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));

//
//
//

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

// hello_world.ejs
app.get('/hello', (req, res) => {
  const templateVars = {
    greeting: 'Hello World Hello World Hello World!',
    listOfObjectives: urlDatabase,
  };
  res.render('hello_world', templateVars);
});
app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
});

//
// ROUTES
//

//
// BROWSE  New Object to get from urlDatabase to templateVars
//
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//
// READ
//
app.post('/urls', (req, res) => {
  // console.log(req.body);
  // console.log(req.body.longURL);
  const shortU = generateRandomString();
  urlDatabase[shortU] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortU}`);
});
function generateRandomString() {
  var random = Math.random().toString(36).slice(7);
  // console.log(random);
  return random;
  // cb(random);
}

//
// ADD
//
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render('urls_show', templateVars);
});
app.get('/u/:shortURL', (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//
// DELITE
//
app.post('/urls/:shortURL/delete', (req, res) => {
  const idToDelete = req.params.shortURL;
  delete urlDatabase[idToDelete];
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

//
// EDIT
//
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const templateVars = {
    shortURL: id,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render('/urls', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  console.log(urlDatabase);
  console.log(templateVars);
  res.render('/urls', req.body);
});

// const idToEdit = urlDatabase[req.params.shortURL];
// let shortU = generateRandomString();
// urlDatabase[shortU] = req.body.longURL;
// console.log(urlDatabase);
// res.redirect(`/urls/${shortU}`);
