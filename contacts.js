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
  new Contact().setAll("Mike", "Jones", "281-330-8004"),
  new Contact().setAll("Jenny", "Keys", "768-867-5309"),
  new Contact().setAll("Max", "Entiger", "214-748-3647"),
  new Contact().setAll("Alicia", "Keys", "515-489-4608"),
].reduce((data, contact) => {
  data[contact.fullName()] = contact;
  return data;
}, Object.create(null));

const sortContacts = (contacts) => {
  return Object.values(contacts).sort((contactA, contactB) => {
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

app.post("/contacts/new",
  (_req, res, next) => {
    res.locals.errMsgs = [];
    res.locals.contact = new Contact();
    next();
  },
  (req, res, next) => {
    try {
      res.locals.contact.setFirstName(req.body.firstName);
    } catch (err) {
      res.locals.errMsgs.push(err.message);
    }
    next();
  },
  (req, res, next) => {
    try {
      res.locals.contact.setLastName(req.body.lastName);
    } catch (err) {
      res.locals.errMsgs.push(err.message);
    }
    next();
  },
  (req, res, next) => {
    try {
      res.locals.contact.setPhoneNumber(req.body.phoneNumber);
    } catch (err) {
      res.locals.errMsgs.push(err.message);
    }
    next();
  },
  (_req, res, next) => {
    if (res.locals.contact.fullName() in contactData) {
      res.locals.errMsgs.push(
        "The contact Full Name (First Name + Last Name) " +
        "must be unique in the contacts list."
      );
    }
    next();
  },
  (req, res, next) => {
    if (res.locals.errMsgs.length === 0) {
      next();
      return;
    }

    res.render("new-contact", {
      errMsgs: res.locals.errMsgs,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });
  },
  (_req, res) => {
    contactData[res.locals.contact.fullName()] = res.locals.contact;

    res.redirect("/contacts");
  }
);

app.listen(PORT, "localhost", () => {
  console.log(`Server listening on port ${PORT}...`);
});
