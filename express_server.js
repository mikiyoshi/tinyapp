const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

//
//  LOGIN INFO
//
const users = {
  abcd: {
    username: 'abcd',
    email: 'abcd@example.com',
    password: 'zzzz',
  },
};

const findUserByUsername = (username) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.username === username) {
      return user;
    }
  }
  return null;
};

//
//  MIDDLEWARE
//

// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
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

app.get('/hello', (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
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
  const username = req.cookies.username;
  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render('urls_index', templateVars);
});

//
// READ
//
app.post('/urls', (req, res) => {
  // console.log(req.body);
  // console.log(req.body.longURL);
  let shortU = generateRandomString();
  urlDatabase[shortU] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortU}`);
});

//
// ADD
//
app.get('/urls/new', (req, res) => {
  const username = req.cookies.username;
  const templateVars = {
    urls: urlDatabase,
    username: username,
  };
  res.render('urls_new', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  console.log(templateVars);
  res.render('urls_show', templateVars);
});
function generateRandomString() {
  var random = Math.random().toString(36).slice(7);
  // console.log(random);
  return random;
  // cb(random);
}
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
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  console.log(`editid: ${id}`);
  urlDatabase[id] = req.body.longURL;
  // console.log(urlDatabase);
  res.render('/urls', req.body);
});

//
// LOGIN
//
app.post('/login', (req, res) => {
  // console.log(req.body);
  // const email = req.body.email;
  // const password = req.body.password;

  const username = req.body.username;
  console.log('username', username);

  if (!username) {
    return res.status(400).send('username cannot be blank');
  }

  const user = findUserByUsername(username);
  console.log('user', user);

  if (!user) {
    return res.status(400).send("a username doesn't exist");
  }

  if (user.username !== username) {
    return res.status(400).send('your username doesnt match');
  }
  // res.cookie('username', username).send('cookie set'); //Sets name = express
  res.cookie('username', username);
  const templateVars = {
    username: username,
    urls: urlDatabase,
  };
  // users[username] = {
  //   username: username,
  // };
  res.render('urls_index', templateVars);

  // happy path
  // res.cookie('user_id', user.id);
  // res.redirect('/secrets');

  // res.send('you posted to login')
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
