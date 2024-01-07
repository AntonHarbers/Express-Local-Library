const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const { DateTime } = require('luxon');

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxlength: 100 },
  family_name: { type: String, required: true, maxlength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual('name').get(function () {
  let fullname = '';
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }

  return fullname;
});

// Virtual for author's url

AuthorSchema.virtual('url').get(function () {
  return `/catalog/author/${this._id}`;
});

AuthorSchema.virtual('lifespan').get(function () {
  if (!this.date_of_birth || !this.date_of_death) return '';

  let lifetime_string = '';
  lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(
    DateTime.DATE_MED
  );

  lifetime_string += ' - ';

  lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(
    DateTime.DATE_MED
  );

  // if has no date of birth and death return empty string

  return lifetime_string;
});

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    : '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    : '';
});

AuthorSchema.virtual('date_of_birth_formatted_iso').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toISODate()
    : '';
});

AuthorSchema.virtual('date_of_death_formatted_iso').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_birth).toISODate()
    : '';
});

module.exports = mongooose.model('Author', AuthorSchema);
