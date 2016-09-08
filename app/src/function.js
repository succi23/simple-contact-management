'use strict';

const unauthorized = (res) => {
  res.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res
    .status(401)
    .json({ message: 'Authorization Required!' });

};

const authorizeUser = (user) => {
  const auth = require('./credentials.js');
  if (user.name == auth.name && user.pass == auth.pass){
    return true;
  } else {
    return false;
  }
};

const validateEmail = (email) => {
  let b = false;
  let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  for (var i = 0; i < email.length; i++) {
    b = re.test(email[i]);
  }
  return b;
}

const checkEmpyProp = (obj) => {
  let data = [];
  if (typeof(obj) == "object"){
    for(let o in obj) {
      data.push(obj[o]);
    }
  } else {
    return false;
  }
  data = data.filter(function(v){
    return v == "";
  });
  if (data.length > 0) {
    return false;
  } else {
    return true;
  }
};

const checkArray = (data) => {
  let success = true;
  try {
    JSON.parse(data);
  } catch (e) {
    success = false;
    return [data];
  }
  if (success) {
    return JSON.parse(data);
  }
}

module.exports = {
  unauthorized: unauthorized,
  authorizeUser: authorizeUser,
  validateEmail: validateEmail,
  checkEmpyProp: checkEmpyProp,
  checkArray: checkArray
}
