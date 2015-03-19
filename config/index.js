var nodeEnv = process.env.NODE_ENV || 'dockerdev';
var config = {
  dockerdev: require('./dockerdev'),
  blackmeshdev: require('./blackmeshdev'),
  blackmeshstage: require('./blackmeshstage'),
  prod: require('./prod')
};

module.exports = config[nodeEnv];
