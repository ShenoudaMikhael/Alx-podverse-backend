var DataTypes = require("sequelize").DataTypes;
var _categories = require("./categories");
var _followers = require("./followers");
var _podcasts = require("./podcasts");
var _users = require("./users");

function initModels(sequelize) {
  var categories = _categories(sequelize, DataTypes);
  var followers = _followers(sequelize, DataTypes);
  var podcasts = _podcasts(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  podcasts.belongsTo(categories, { as: "cat", foreignKey: "cat_id"});
  categories.hasMany(podcasts, { as: "podcasts", foreignKey: "cat_id"});
  followers.belongsTo(users, { as: "follower", foreignKey: "follower_id"});
  users.hasMany(followers, { as: "followers", foreignKey: "follower_id"});
  followers.belongsTo(users, { as: "followed_creator", foreignKey: "followed_creator_id"});
  users.hasMany(followers, { as: "followed_creator_followers", foreignKey: "followed_creator_id"});
  podcasts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(podcasts, { as: "podcasts", foreignKey: "user_id"});

  return {
    categories,
    followers,
    podcasts,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
