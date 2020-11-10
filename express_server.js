const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = 8080;
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  let output = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    output += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return output;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.send("Hello!");
});

// POST method for submitting a new url
app.post("/urls", (req, res) => {
  const shortendString = generateRandomString();
  urlDatabase[shortendString] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username']
  };

  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   };

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username'] 
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log("Deleting....");
  res.redirect("/urls");
});

// Update function
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// Login 
app.post("/login", (req, res) => {
  console.log("Logging in...");
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  console.log("Logging out...");
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Server started listening on port ${PORT}`);
});

