const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, urlsForUser, getUserByEmail } = require("./helpers");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aj48lW", dateCreated: "Fri Oct 30 2020", numVisits: 0 },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aj48lW", dateCreated: "Mon Nov 02 2020", numVisits: 0 }
};

const users = {

};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


// POST method for submitting a new url
app.post("/urls", (req, res) => {
  const shortendString = generateRandomString();
  const userID = req.session.user_id;
  const date = new Date();
  urlDatabase[shortendString] = {
    longURL: req.body.longURL,
    userID: userID,
    dateCreated: date.toDateString(),
    numVisits: 0
  };

  console.log(urlDatabase[shortendString]);
  res.redirect("/urls");
});

// Create new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id,
  };

  if(req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
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
    res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    user_id: req.session.user_id,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users
  };

  res.render("urls_show", templateVars);
});

// Redirect to long url version of the shortened one
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  urlDatabase[req.params.shortURL].numVisits++;
  res.redirect(longURL);
});

// Delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    console.log("Deleting....");
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});


// Update function
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});


// Login 
app.post("/login", (req, res) => {
  const userLookup = getUserByEmail(users, req.body.email);
  console.log("Logging in...");
  if (!userLookup || !bcrypt.compareSync(req.body.password, users[userLookup].password)) {
    console.log("User doesn't exist");
    console.log("Or incorrect password");
    res.sendStatus(403);
  } else if(userLookup && bcrypt.compareSync(req.body.password,users[userLookup].password)) {
    req.session.user_id =  userLookup;
    res.redirect("/urls");
  }
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users
  };

  res.render("login", templateVars);
})

// Logout
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
  }
  res.render("register", templateVars);
});

// Handle Registration
app.post("/register", (req, res) => {
  console.log("creating user");
  if (req.body.email === "" || req.body.password === "") {
    console.log("Empty field");
    res.sendStatus(400);
  } else if (getUserByEmail(users, req.body.email)) {
    console.log("User exists");
    res.sendStatus(400);
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

