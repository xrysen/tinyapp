
/**
 * Generates a random string of 6 alphanumeric characters and returns it
 */

const generateRandomString = () => {
  let output = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

 /**
  * Searches an object for the corresponding email (passed in as a string)
  * Input:
  *   - An object
  *   - A string 
  * Output:
  *   - Returns the key of the object whose email property matches the string if found
  *   - Return false if no match is found 
  */

const findEmail = (obj, email) => {
  const keys = Object.keys(obj);
  for (let items of keys) {
    if (obj[items].email === email) {
      return items;
    }
  }
  return false;
};

module.exports = {
  generateRandomString,
  findEmail
};