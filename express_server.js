const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
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
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.status(401);
    res.redirect("/login");
  }
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
    res.status(401);
    res.send("<h1 style = 'text-align: center'>You are not Authorized to View this Page</h1><br /><h3 style = 'text-align: center'> Please <a href = '/login'>Login</a> or <a href = '/register'>Register</a> for a new account");
  }

});

// Create new url
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
    res.status(401);
    res.send("<h1 style = 'text-align: center'>You are not Authorized to View this Page</h1><br /><h3 style = 'text-align: center'> Please <a href = '/login'>Login</a> or <a href = '/register'>Register</a> for a new account");
  }

});

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
      res.status(401);
      res.send("<h1 style = 'text-align: center'>You are not Authorized to View this Page</h1><br /><h3 style = 'text-align: center'> Please <a href = '/login'>Login</a> to your account to view.");
    }
  } else {
    res.status(404);
    res.send("<h1 style = 'text-align: center'>Short URL Doesn't Exist</h1> <br /><h3 style = 'text-align: center'> Try creating a <a href = '/urls/new'>new one</a></h3>");
  }

});

// Redirect to long url version of the shortened one
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    urlDatabase[req.params.shortURL].numVisits++;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("<h1 style = 'text-align: center'>Short URL Doesn't Exist</h1> <br /><h3 style = 'text-align: center'> Try creating a <a href = '/urls/new'>new one</a></h3>");
  }
});


// Delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send(`<h1 style = "text-align: center">You are not authorized to make this action.</h1>`);
  }
});


// Update function
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else if (req.session._user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send("<h1 style = 'text-align: center'>This link belongs to someone else. Please sign in to the appropriate account to view</h1>");
  } else {
    res.status(401);
    res.send("<h1 style = 'text-align: center'>You are not Authorized to View this Page</h1><br /><h3 style = 'text-align: center'> Please <a href = '/login'>Login</a> to your account to view.");
  }
});


// Login
app.post("/login", (req, res) => {
  const userLookup = getUserByEmail(users, req.body.email);
  if (!userLookup || !bcrypt.compareSync(req.body.password, users[userLookup].password)) {
    res.status(403);
    res.send(`<h1 style = "text-align: center;">Either the username or password provided are incorrect. Please <a href = "/login">try again.</a>`);
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
    res.status(400);
    res.send(`<h1 style = "text-align: center;">One of the forms was left empty. <a href = "/register">Please fill out both forms</a>`);
  } else if (getUserByEmail(users, req.body.email)) {
    console.log("User exists");
    res.status(400);
    res.send(`<h1 style = "text-align: center;">A user with that e-mail already has an account. <a href = "/register">Please try again</a>`);
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