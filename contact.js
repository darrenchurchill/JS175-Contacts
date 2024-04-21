/**
 * JS175 Project
 * Contacts
 * contact.js
 */

class Contact {
  static MAX_NAME_LENGTH = 25;
  static VALID_NAME_CHARS = /[a-z ]/i;
  static VALID_PHONE_FORMAT = /(\d{3})-?(\d{3})-?(\d{4})/;

  constructor(firstName, lastName, phoneNumber) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    return this;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

module.exports = Contact;
