/**
 * JS175 Project
 * Contacts
 * contacts.js
 */
const express = require("express");
const morgan = require("morgan");

const Contact = require("./contact");

const PORT = 3000;
const app = express();

// NOTE: You could also use app.locals to store this contact data and express
// will automatically make the variable available to the template engine.
// https://expressjs.com/en/4x/api.html#app.locals
let contactData = [
  new Contact("Mike", "Jones", "281-330-8004",),
  new Contact("Jenny", "Keys", "768-867-5309",),
  new Contact("Max", "Entiger", "214-748-3647",),
  new Contact("Alicia", "Keys", "515-489-4608",),
];

const sortContacts = (contacts) => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName === contactB.lastName) {
      return contactA.firstName.localeCompare(contactB.firstName);
    }
    return contactA.lastName.localeCompare(contactB.lastName);
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
// This call, to use the express.urlencoded middleware function, could also be
// placed as app.post's first callback below, if you only want to parse request
// bodies for one particular route.
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (_req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (_req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (_req, res) => {
  res.render("new-contact");
});

app.post("/contacts/new", (req, res) => {
  contactData.push(new Contact(
    req.body.firstName,
    req.body.lastName,
    req.body.phoneNumber
  ));

  res.redirect("/contacts");
});

app.listen(PORT, "localhost", () => {
  console.log(`Server listening on port ${PORT}...`);
});
