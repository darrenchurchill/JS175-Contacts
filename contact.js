/**
 * JS175 Project
 * Contacts
 * contact.js
 */

class Contact {
  static MAX_NAME_LENGTH = 25;
  static INVALID_NAME_CHARS = /[^a-z ]/i;
  static INVALID_PHONE_CHARS = /[^\d-]/;
  static PHONE_FORMAT = /(\d{3})-?(\d{3})-?(\d{4})/;

  constructor() {
    return this;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // eslint-disable-next-line max-lines-per-function
  #validatedName(name, msgPrefix) {
    if (!name) {
      throw new Error(`${msgPrefix} is a required field.`, {
        cause: { code: "requiredArg", value: name }
      });
    }

    name = name.trim();

    if (name.length > Contact.MAX_NAME_LENGTH) {
      throw new Error(
        `${msgPrefix} must be ${Contact.MAX_NAME_LENGTH} letters or less, ` +
        "not including leading or trailing whitespace.",
        {
          cause: { code: "maxLengthExceeded", value: name },
        }
      );
    }

    if (Contact.INVALID_NAME_CHARS.test(name)) {
      throw new Error(`${msgPrefix} must contain only letters and spaces.`, {
        cause: { code: "invalidChars", value: name }
      });
    }

    return name;
  }

  // eslint-disable-next-line max-lines-per-function
  #validatedPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
      throw new Error("Phone Number is a required field.", {
        cause: { code: "requiredArg", value: phoneNumber }
      });
    }

    phoneNumber = phoneNumber.trim();

    if (Contact.INVALID_PHONE_CHARS.test(phoneNumber)) {
      throw new Error(
        'Phone Number can contain only digits (0-9) and dashes ("-"), ' +
        "not including leading or trailing whitespace.",
        {
          cause: { code: "invalidChars", value: phoneNumber },
        }
      );
    }

    if (!Contact.PHONE_FORMAT.test(phoneNumber)) {
      throw new Error(
        "Phone Number must contain exactly 10 digits in the form: ###-###-####. " +
        "Dashes are optional.",
        {
          cause: { code: "invalidFormat", value: phoneNumber }
        }
      );
    }

    phoneNumber = phoneNumber.split("-").join("");

    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  }

  setAll(firstName, lastName, phoneNumber) {
    this.setFirstName(firstName);
    this.setLastName(lastName);
    this.setPhoneNumber(phoneNumber);
    return this;
  }

  setFirstName(name) {
    this.firstName = this.#validatedName(name, "First Name");
    return this;
  }

  setLastName(name) {
    this.lastName = this.#validatedName(name, "Last Name");
    return this;
  }

  setPhoneNumber(phoneNumber) {
    this.phoneNumber = this.#validatedPhoneNumber(phoneNumber);
    return this;
  }
}

module.exports = Contact;
