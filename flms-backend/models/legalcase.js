'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LegalCase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LegalCase.init({
    Worker_ID: DataTypes.INTEGER,
    Reported_By: DataTypes.INTEGER,
    Case_Type: DataTypes.STRING,
    Report_Date: DataTypes.DATE,
    Status: DataTypes.STRING,
    Notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'LegalCase',
  });
  return LegalCase;
};