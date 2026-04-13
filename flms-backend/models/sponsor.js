'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sponsor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sponsor.hasMany(models.Worker, { foreignKey: 'Sponsor_ID' });
    }
  }
  Sponsor.init({
    Commercial_Reg_No: DataTypes.STRING,
    Sponsor_Name: DataTypes.STRING,
    Phone: DataTypes.STRING,
    Email: DataTypes.STRING,
    Address: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Sponsor',
  });
  return Sponsor;
};