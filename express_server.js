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

let errorCode = 0;

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
  console.log(res.statusCode);
 
  switch(req.statusCode) {
    case 401: // Not Authorized
      templateVars.errorString = "You are not Authorized to View this Page. Please Login or Register for a new account";
      break;
    case 404: // Doesn't exist
      templateVars.errorString = "Short URL doesn't exist. Please try making one!";
      break;
    case 403: // Forbidden
      templateVars.errorString = "Action not allowed";
      break;

    case 400: // Bad Request
      templateVars.errorString = "User name or password was left blank. Please try again";
      break;

    default:
      templateVars.errorString = "Short URL doesn't exist.";
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
    res.status(401).sendFile("/error");
    
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
    res.statusCode = 401;
    res.redirect("/error");
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
    res.redirect("/error");
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
      res.redirect("/error");
    }
  } else {
    res.status(404);
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
    res.status(404);
    res.redirect("/error");
  }
});


// Delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    console.log("Deleting....");
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
    res.redirect("/error");
  }
});


// Update function
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
    res.redirect("/error");
  }
});


// Login 
app.post("/login", (req, res) => {
  const userLookup = getUserByEmail(users, req.body.email);
  console.log("Logging in...");
  if (!userLookup || !bcrypt.compareSync(req.body.password, users[userLookup].password)) {
    res.sendStatus(403);
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

  res.render("login", templateVars);
})

// Logoutres.send("<h3 style = 'text-align: center;'>User name or password was left blank. Please <a href = '/register'>try again.</a>");
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
    res.status(400);
    res.redirect("/error");
  } else if (getUserByEmail(users, req.body.email)) {
    res.status(400);
    res.send("<h3 style = 'text-align: center;'>An account with that e-mail already exists. Please <a href = '/login'>Login</a></h3>");
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

