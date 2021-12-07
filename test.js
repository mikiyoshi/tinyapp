function generateRandomString() {
  var random = Math.random().toString(36).slice(7);
  console.log(random);
}
generateRandomString();
