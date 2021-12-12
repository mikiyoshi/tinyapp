const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};
const findDatabaseById = (id) => {
  for (let i = 0; i < Object.keys(urlDatabase).length; i++) {
    const key = Object.keys(urlDatabase)[i];
    console.log(id);
    console.log(key);
    if (key === id) {
      console.log('OK', id);
      console.log('OK DB', urlDatabase[key]);
      return urlDatabase[key];
    }
  }
};
findDatabaseById('i3BoGr');
