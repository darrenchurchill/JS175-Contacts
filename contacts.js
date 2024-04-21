/**
 * JS175 Project
 * Contacts
 * contacts.js
 */
const express = require("express");
const { body, matchedData, validationResult } = require("express-validator");
const morgan = require("morgan");

const Contact = require("./contact");

const PORT = 3000;
const app = express();

// NOTE: You could also use app.locals to store this contact data and express
// will automatically make the variable available to the template engine.
// https://expressjs.com/en/4x/api.html#app.locals
let contactData = [
  new Contact("Mike", "Jones", "281-330-8004"),
  new Contact("Jenny", "Keys", "768-867-5309"),
  new Contact("Max", "Entiger", "214-748-3647"),
  new Contact("Alicia", "Keys", "515-489-4608"),
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

function createNameChain(fieldName, msgPrefix) {
  return body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${msgPrefix} is required.`)
    .bail()
    .isLength({ max: Contact.MAX_NAME_LENGTH })
    .withMessage(`${msgPrefix} must be ${Contact.MAX_NAME_LENGTH} letters or less.`)
    .matches(Contact.VALID_NAME_CHARS)
    .withMessage(`${msgPrefix} must only contain letters and spaces.`);
}

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
  createNameChain("firstName", "First Name"),
  createNameChain("lastName", "Last Name"),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required.")
    .bail()
    .matches(Contact.VALID_PHONE_FORMAT)
    .withMessage("Phone number must be in the form ###-###-####"),

  (req, res, next) => {
    let result = (
      validationResult.withDefaults({
        formatter: (err) => err.msg
      })
    )(req);

    if (result.isEmpty()) {
      next();
      return;
    }

    res.render("new-contact", {
      errMsgs: result.array(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });
  },

  (req, res) => {
    let data = matchedData(req);
    let contact = new Contact(data.firstName, data.lastName, data.phoneNumber);
    contactData[contact.fullName()] = contact;

    res.redirect("/contacts");
  }
);

app.listen(PORT, "localhost", () => {
  console.log(`Server listening on port ${PORT}...`);
});
