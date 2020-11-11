const generateRandomString = () => {
  let output = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

const findEmail = (obj, email) => {
  const keys = Object.keys(obj);
  for (items of keys) {
    if (obj[items].email === email) {
      return items;
    }
  }
  return false;
}

module.exports = {
  generateRandomString,
  findEmail
};