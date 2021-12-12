const express = require('express');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
// app.use(cookieParser());
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// generate random string for short url
const generateRandomString = () => {
  let randomString = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};

// temp database object
const urlDatabase = {
  b2xVn2: {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user01',
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user02',
  },
};

// user database
const users = {
  // abcd: {
  //   id: 'abcd',
  //   email: 'abcd@example.com',
  //   password: 'zzzz',
  // },
  // userRandomID: {
  //   id: 'userRandomID',
  //   email: 'user@example.com',
  //   password: 'purple-monkey-dinosaur',
  // },
  // user2RandomID: {
  //   id: 'user2RandomID',
  //   email: 'user2@example.com',
  //   password: 'dishwasher-funk',
  // },
};

// helper function: check email exists in database
const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

// helper function: authenticate user
const authenticateUser = (email, password, db) => {
  // get user object
  const user = findUserByEmail(email, db);

  // check that passwords match => return user object
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

// helper function: user urls object
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// add post route to receive form submission
app.get('/urls', (request, response) => {
  const userID = request.session.user_id;

  const templateVars = {
    urls: urlsForUser(userID, urlDatabase),
    user: users[userID],
  };
  response.render('urls_index', templateVars);
});

// add route to show url submit form
app.get('/urls/new', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  if (userID) {
    response.render('urls_new', templateVars);
  } else {
    response.redirect('/login');
  }
});

// redirect short urls
app.get('/u/:shortURL', (request, response) => {
  const { longURL } = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

// redirect after form submission
app.post('/urls', (request, response) => {
  const shortURL = generateRandomString();
  const userID = request.session.user_id;
  urlDatabase[shortURL] = {
    longURL: request.body.longURL,
    userID,
  };

  // console.log(request.body); // Log the POST request body to the console
  response.redirect(`/urls/${shortURL}`);
});

// key: request.params.shortURL
// value: urlDatabase[request.params.shortURL]
app.get('/urls/:shortURL', (request, response) => {
  const userID = request.session.user_id;
  // const { longURL } = urlDatabase[request.params.shortURL];
  const templateVars = {
    shortURL: request.params.shortURL,
    longURL: urlDatabase[request.params.shortURL].longURL,
    user: users[userID],
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/delete', (request, response) => {
  const userID = request.session.user_id;
  const { shortURL } = request.params;

  // check to see if user can delete urls
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    delete urlDatabase[shortURL];
    response.redirect('/urls');
  } else {
    response.status(400).send('You do not have permissions to delete urls.');
  }
});

app.post('/urls/:id', (request, response) => {
  const { longURL } = request.body;
  const shortURL = request.params.id;
  const userID = request.session.user_id;

  // check to see if user can edit urls
  const userURLS = urlsForUser(userID, urlDatabase);
  if (Object.keys(userURLS).includes(shortURL)) {
    urlDatabase[shortURL].longURL = longURL;
    response.redirect('/urls');
  } else {
    response.status(400).send('You do not have permissions to edit urls.');
  }
});

// create login page from template
app.get('/login', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('login', templateVars);
});

// create cookie for login
app.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;

  const user = authenticateUser(email, password, users);

  if (user) {
    request.session.user_id = userID;
    response.redirect('/urls');
    return;
  }
  // user is not authenticated
  response.status(403).send('wrong credentials!');
});

// clear cookie for logout
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});

// create registration page from template
app.get('/register', (request, response) => {
  const userID = request.session.user_id;
  const templateVars = {
    user: users[userID],
  };
  response.render('register', templateVars);
});

// registration handler
app.post('/register', (request, response) => {
  const userID = generateRandomString();
  const userEmail = request.body.email;
  const userPass = request.body.password;

  const userFound = findUserByEmail(userEmail, users);

  // if email or password is blank send error
  if (userEmail === '' || userPass === '') {
    response.status(400).send('Please fill in all fields.');
  }

  // if email already in database send error
  if (userFound) {
    response
      .status(400)
      .send('Sorry, a user is already registered with this email.');
    return;
  }

  // create new user in database
  users[userID] = {
    id: userID,
    email: userEmail,
    // hash password
    password: bcrypt.hashSync(userPass, 10),
  };

  // create user id cookie
  request.session.user_id = userID;
  // console.log(users);
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
