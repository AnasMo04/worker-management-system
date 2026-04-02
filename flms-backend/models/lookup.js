'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lookup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Lookup.init({
    Type: DataTypes.STRING,
    Code: DataTypes.STRING,
    Value: DataTypes.STRING,
    Metadata: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Lookup',
  });
  return Lookup;
};