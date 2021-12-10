const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const urlDatabase = {
  // b2xVn2: 'http://www.lighthouselabs.ca',
  // '9sm5xK': 'http://www.google.com',
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
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

const findDatabaseById = (id) => {
  for (const databaseId in urlDatabase) {
    const databese = urlDatabase[databaseId];
    if (databese.id === id) {
      return databese;
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
// Home  get dispaly page
//
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//
// JSON  get dispaly page
//
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
// app.get('/hello', (req, res) => {
//   res.send('<html><body>Hello <b>World</b></body></html>\n');
// });

//
// Hello  get dispaly page
//
app.get('/hello', (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

//
// Set  get dispaly page
//
app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

//
// Fetch  get dispaly page
//
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
  const email = req.cookies.email;
  const templateVars = {
    urls: urlDatabase,
    email: email,
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
// ADD get dispaly page
//
app.get('/urls/new', (req, res) => {
  const email = req.cookies.email;
  console.log(email);

  if (email) {
    const templateVars = {
      urls: urlDatabase,
      email: email,
    };
    res.render('urls_new', templateVars);
  }
  res.redirect('/login');
});

//
// short URL  get dispaly page
//
app.get('/urls/:shortURL', (req, res) => {
  const id = req.body.id;
  const email = req.cookies.email;
  // console.log(email);
  // console.log(urlDatabase);
  const database = findDatabaseById(id);
  console.log('database', database);

  if (email) {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: database.longURL,
      email: email,
    };
    console.log(templateVars);
    res.render('urls_show', templateVars);
  }
  res.redirect('/login');
});

//
// Number generate
//
function generateRandomString() {
  var random = Math.random().toString(36).slice(7);
  // console.log(random);
  return random;
  // cb(random);
}

//
// short URL page
//
app.get('/u/:shortURL', (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

//
// DELITE
//
app.post('/urls/:shortURL/delete', (req, res) => {
  const email = req.cookies.email;
  console.log(email);

  if (email) {
    const idToDelete = req.params.shortURL;
    delete urlDatabase[idToDelete];
    console.log(urlDatabase);
    res.redirect(`/urls`);
  }
  res.redirect('/login');
});

//
// EDIT
//
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  console.log(`editid: ${id}`);
  // const database = findDatabaseById(id);
  // console.log('database', database);

  urlDatabase[id] = req.body.longURL;
  console.log(urlDatabase);
  res.render('/urls', req.body);
});

//
// LOGIN
//
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log(id);
  console.log(email);
  console.log(password);

  if (!email || !password) {
    return res.status(400).send('email and password cannot be blank');
  }

  const user = findUserByEmail(email);
  console.log('user', user);

  if (!user) {
    return res.status(400).send("a user with that email doesn't exist");
  }

  if (user.password !== password) {
    return res.status(400).send('your password doesnt match');
  }

  // happy path
  res.cookie('id', user.id);
  res.redirect('/secrets');
});

//
// register
//
app.post('/register', (req, res) => {
  // const id = req.body.id;
  const email = req.body.email;
  const password = req.body.password;
  // console.log('id', id);
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

  res.cookie('email', email);
  users[id] = {
    id: id,
    email: email,
    password: password,
  };
  const templateVars = {
    id: users,
    email: email,
    urls: urlDatabase,
  };
  console.log('users', templateVars);
  res.render('urls_index', templateVars);
  // res.redirect('/login');
});

//
// secrets
//
app.get('/secrets', (req, res) => {
  const id = req.cookies.id;
  const email = req.body.email;

  if (!id) {
    return res.status(401).send('you are not authorized to be here');
  }

  const user = users[id];

  if (!user) {
    return res
      .status(400)
      .send('you have a stale cookie. please create an account or login');
  }

  res.cookie('email', email);
  console.log('the logged in user is', user);
  const templateVars = {
    email: user.email,
  };

  res.render('login', templateVars);
});

//
// login get dispaly page
//
app.get('/login', (req, res) => {
  const email = req.body.email;
  const templateVars = {
    email: email,
    urls: urlDatabase,
  };
  res.render('login', templateVars);
  // res.render('login');
});

//
// register get dispaly page
//
app.get('/register', (req, res) => {
  const email = req.body.email;
  const templateVars = {
    email: email,
    urls: urlDatabase,
  };
  res.render('register', templateVars);
  // res.render('register');
});

//
// logout
//
app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.clearCookie('email');
  res.redirect('/urls');
});
