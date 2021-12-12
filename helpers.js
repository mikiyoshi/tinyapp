const findUserByEmail = (email, database) => {
  // console.log('helper.js findUserByEmail', email);
  // console.log('helper.js findUserByEmail', database);
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { findUserByEmail };
