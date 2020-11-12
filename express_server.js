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
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

<<<<<<< HEAD
<<<<<<< HEAD
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

=======

app.get("/forbidden", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id
  };
  res.render("not_loggedin", templateVars);
});


>>>>>>> parent of a1136aa... Changed how permissions were handled. Added error catching for incorrect user logged in trying to edit specific URL and if the specific URL doesn't exist
=======
>>>>>>> parent of bae08dc... Added a new way to handle errors that gives relevant error messages based on the status code
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

<<<<<<< HEAD
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
=======
  res.redirect("/urls");
>>>>>>> parent of bae08dc... Added a new way to handle errors that gives relevant error messages based on the status code
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
<<<<<<< HEAD
<<<<<<< HEAD
    res.statusCode = 401;
    res.redirect("/error");
=======
    res.redirect("/login");
>>>>>>> parent of a1136aa... Changed how permissions were handled. Added error catching for incorrect user logged in trying to edit specific URL and if the specific URL doesn't exist
=======
    res.status(401);
    res.redirect("/login");
>>>>>>> parent of bae08dc... Added a new way to handle errors that gives relevant error messages based on the status code
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
<<<<<<< HEAD
    res.status(401);
<<<<<<< HEAD
    res.redirect("/error");
=======
    res.redirect("/forbidden");
>>>>>>> parent of a1136aa... Changed how permissions were handled. Added error catching for incorrect user logged in trying to edit specific URL and if the specific URL doesn't exist
=======
    res.send("<h1 style = 'text-align: center'>You are not Authorized to View this Page</h1><br /><h3 style = 'text-align: center'> Please <a href = '/login'>Login</a> or <a href = '/register'>Register</a> for a new account");
>>>>>>> parent of bae08dc... Added a new way to handle errors that gives relevant error messages based on the status code
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    user_id: req.session.user_id,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users
  };

<<<<<<< HEAD
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

=======
  res.render("urls_show", templateVars);
>>>>>>> parent of a1136aa... Changed how permissions were handled. Added error catching for incorrect user logged in trying to edit specific URL and if the specific URL doesn't exist
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
  if (req.session.user_id === urlDatabase[shortURL].userID) {
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
  if (req.session.user_id === urlDatabase[shortURL].userID) {
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
<<<<<<< HEAD
    res.status(400);
    res.redirect("/error");
=======
    console.log("Empty field");
    res.sendStatus(400);
>>>>>>> parent of bae08dc... Added a new way to handle errors that gives relevant error messages based on the status code
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

