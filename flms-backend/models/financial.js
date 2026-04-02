'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Financial extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Financial.init({
    Sponsor_ID: DataTypes.INTEGER,
    Worker_ID: DataTypes.INTEGER,
    Amount: DataTypes.DECIMAL,
    Service_Type: DataTypes.STRING,
    Payment_Gateway_Ref: DataTypes.STRING,
    Status: DataTypes.STRING,
    Date: DataTypes.DATE,
    Created_By: DataTypes.INTEGER,
    Notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Financial',
  });
  return Financial;
};