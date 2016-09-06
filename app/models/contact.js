'use strict';

const
  mongoose = require('mongoose');

let ContactSchema = new mongoose.Schema({
  name: {
    type: String
  },
  nick_name: {
    type: String
  },
  title: {
    type: String
  },
  email: {
    type: [String]
  },
  phone: {
    type: [String]
  },
  address: {
    type: [String]
  },
  company: {
    type: String
  },
  created_at: {
    type: Date
  },
  updated_at: {
    type: Date,
  }
});

ContactSchema.pre('save', function(next){
  let now = new Date();
  this.updated_at = now;
  if (!this.nick_name)  this.nick_name = this.name.split(" ")[0];
  if (!this.created_at) this.created_at = now;
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
