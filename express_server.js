const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, urlsForUser, getUserByEmail } = require("./helpers");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aj48lW", dateCreated: "Fri Oct 30 2020", numVisits: 0 },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aj48lW", dateCreated: "Mon Nov 02 2020", numVisits: 0 }
};

// Set up an Object database to store users
const users = {

};

// Keeps track of error codes and is used by the error page to determine what is output
let errorCode = 0;

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.status(401);
    res.redirect("/login");
  }
});

app.get("/error", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id,
    errorString: ""
  };

  res.status(errorCode);
  switch (errorCode) {
  case 401:
    templateVars.errorString = "You are not Authorized to View this Page";
    break;
  case 404:
    templateVars.errorString = "The Page you are Looking for Doesn't Exist";
    break;
  case 403:
    templateVars.errorString = "You are not authorized to make this change";
    break;
  case 400:
    templateVars.errorString = "Either the username or password provided are incorrect.";
    break;
  case 406:
    templateVars.errorString = "Either the username or password field was left blank. Please fill in both forms.";
    break;
  case 409:
    templateVars.errorString = "A user with that e-mail already exists.";
    break;
  }
  res.render("error", templateVars);
});

// POST method for submitting a new url
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortendString = generateRandomString();
    const userID = req.session.user_id;
    const date = new Date();
    urlDatabase[shortendString] = {
      longURL: req.body.longURL,
      userID: userID,
      dateCreated: date.toDateString(),
      numVisits: 0
    };
    res.redirect(`/urls/${shortendString}`);
  } else {
    errorCode = 401;
    res.redirect("/error");
  }
});


// Creates a new tinyurl for the address provided
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id,
  };

  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.status(401);
    res.redirect("/login");
  }
});


// Show created Tiny URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urlDB: urlDatabase,
    urls: urlsForUser(urlDatabase, req.session.user_id),
    user: users,
    user_id: req.session.user_id
  };

  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    errorCode = 401;
    res.redirect("/error");
  }
});

// Shows status for the tinyurl provided and also allows the user to update the address the tinyurl redirects to
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {
      shortURL: req.params.shortURL,
      user_id: req.session.user_id,
      longURL: urlDatabase[req.params.shortURL].longURL,
      dateCreated: urlDatabase[req.params.shortURL].dateCreated,
      numVisits: urlDatabase[req.params.shortURL].numVisits,
      user: users
    };

    if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
      res.render("urls_show", templateVars);
    } else {
      errorCode = 401;
      res.redirect("/error");
    }
  } else {
    errorCode = 404;
    res.redirect("/error");
  }
});

// Redirect to long url version of the shortened one
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    urlDatabase[req.params.shortURL].numVisits++;
    res.redirect(longURL);
  } else {
    errorCode = 404;
    res.redirect("/error");
  }
});

// Delete URL from database
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    errorCode = 404;
    res.redirect("/error");
  } else if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    errorCode = 403;
    res.redirect("/error");
  }
});

// Updates existing tinyurl to the new address provided
app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    errorCode = 404;
    res.redirect("/error");
  }

  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    errorCode = 401;
    res.redirect("/error");
  }
});

// Looks for user in database and if they exist logs them in
app.post("/login", (req, res) => {
  const userLookup = getUserByEmail(users, req.body.email);
  if (!userLookup || !bcrypt.compareSync(req.body.password, users[userLookup].password)) {
    errorCode = 400;
    res.redirect("/error");
  } else if (userLookup && bcrypt.compareSync(req.body.password, users[userLookup].password)) {
    req.session.user_id = userLookup;
    res.redirect("/urls");
  }
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users
  };

  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Logout and delete cookie session
app.post("/logout", (req, res) => {
  console.log("Logging out...");
  req.session = null;
  res.redirect("/login");
});

// Registration Page
app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// Handle Registration
app.post("/register", (req, res) => {
  console.log("creating user");
  if (req.body.email === "" || req.body.password === "") {
    errorCode = 406;
    res.redirect("/error");
  } else if (getUserByEmail(users, req.body.email)) {
    errorCode = 409;
    res.redirect("/error");
  } else {
    const randomId = generateRandomString();
    users[randomId] = {};
    users[randomId].email = req.body.email;
    users[randomId].password = bcrypt.hashSync(req.body.password, 10);
    req.session.user_id = randomId;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Server started listening on port ${PORT}`);
});







