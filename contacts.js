/**
 * JS175 Project
 * Contacts
 * contacts.js
 */
const store = require("connect-loki");
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const { body, matchedData, validationResult } = require("express-validator");
const morgan = require("morgan");

const Contact = require("./contact");

const PORT = 3000;
const app = express();
const LokiStore = store(session);

// NOTE: You could also use app.locals to store this contact data and express
// will automatically make the variable available to the template engine.
// https://expressjs.com/en/4x/api.html#app.locals
const contactData = [
  new Contact("Mike", "Jones", "281-330-8004"),
  new Contact("Jenny", "Keys", "768-867-5309"),
  new Contact("Max", "Entiger", "214-748-3647"),
  new Contact("Alicia", "Keys", "515-489-4608"),
].reduce((data, contact) => {
  data[contact.fullName()] = contact;
  return data;
}, Object.create(null));

const clone = (object) => JSON.parse(JSON.stringify(object));

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
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // ms => 31 days
    path: "/",
    secure: false,
  },
  name: "launch-school-contacts-manager-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
  store: new LokiStore({}),
}));
app.use((req, _res, next) => {
  if (!("contactData" in req.session)) {
    req.session.contactData = clone(contactData);
  }
  next();
});
// express-flash's flash() wraps res.render() to set res.locals.messages with
// req.flash()'s no-arg result. So, you can use the `messages` variable in any
// rendered template. It will have ({string} type, {Array.<string>} msgs)
// key/values, populated by any req.flash() calls to add flash messages.
app.use(
  flash(),

  // Re-wrap express-flash's res.render() to save the session to store, when
  // required.
  // express-flash's res.render()'s implicitly sets res.locals.messages and
  // resets req.session.flash through a no-arg req.flash() call.
  // For some reason, flash messages can persist between multiple requests if
  // you don't explicitly save the session data to the store. Calling
  // req.flash() with no arguments does clear req.session.flash, but the
  // update doesn't always make its way to the session store. It's at least a
  // problem with express-session and connect-loki.
  (req, res, next) => {
    const render = res.render;
    res.render = function(...args) {
      // If there's data in req.session.flash, we'll need to save after
      // rendering.
      const requireSave =
        req.session.flash && Object.keys(req.session.flash).length > 0;
      render.apply(res, args);
      if (requireSave) req.session.save();
    };

    next();
  }
);

app.get("/", (_req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(req.session.contactData),
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
    .withMessage("Phone number must be in the form ###-###-####")
    .customSanitizer((phone) => {
      phone = phone.split("-").join("");
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }),

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

    result.array().forEach((errMsg) => req.flash("error", errMsg));

    res.render("new-contact", {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });
  },

  (req, res) => {
    let data = matchedData(req);
    let contact = new Contact(data.firstName, data.lastName, data.phoneNumber);
    req.session.contactData[contact.fullName()] = contact;

    req.flash("success", "New contact added to list!");
    res.redirect("/contacts");
  }
);

app.listen(PORT, "localhost", () => {
  console.log(`Server listening on port ${PORT}...`);
});
