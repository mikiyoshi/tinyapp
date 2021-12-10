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
    id: 'abcd',
    email: 'abcd@example.com',
    password: 'zzzz',
  },
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};
const findUserById = (id) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.id === id) {
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
  const id = req.cookies.id;
  const templateVars = {
    urls: urlDatabase,
    id: id,
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
  const id = req.cookies.id;
  const templateVars = {
    urls: urlDatabase,
    id: id,
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
  const id = req.body.id;
  console.log('id', id);

  if (!id) {
    return res.status(400).send('id cannot be blank');
  }

  const user = findUserById(id);
  console.log('user', user);

  if (!user) {
    return res.status(400).send("a id doesn't exist");
  }

  if (user.id !== id) {
    return res.status(400).send('your id doesnt match');
  }
  res.cookie('id', id);
  const templateVars = {
    id: id,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

//
// register
//
app.post('/register', (req, res) => {
  // const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  // console.log('username', username);
  console.log('email', email);
  console.log('password', password);

  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }

  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('a user with that email already exists');
  }

  const id = Math.floor(Math.random() * 2000) + 1;

  // res.cookie('username', username);
  // const templateVars = {
  //   id: username,
  //   email: email,
  //   password: password,
  //   urls: urlDatabase,
  // };
  users[id] = {
    id: id,
    email: email,
    password: password,
  };
  const templateVars = {
    id: id,
    urls: urlDatabase,
  };
  console.log('users', templateVars);
  res.render('urls_index', templateVars);
  // res.redirect('/login');
});
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.redirect('/urls');
});
