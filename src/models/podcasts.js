
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('podcasts', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.UUID, // UUID type for the column
      defaultValue: DataTypes.UUIDV4, // Sequelize's built-in UUID generator (if you want to use it)
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    is_live: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    hooks: {
      beforeCreate: (instance) => {
        if (!instance.uuid) {
          instance.uuid = uuidv4(); // Use the 'uuid' package to generate UUID
        }
      }
    },
    sequelize,
    tableName: 'podcasts',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "creator_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "cat_id",
        using: "BTREE",
        fields: [
          { name: "cat_id" },
        ]
      },
    ]
  });
};
