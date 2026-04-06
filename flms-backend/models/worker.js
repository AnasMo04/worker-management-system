'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Worker extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Worker.belongsTo(models.Sponsor, { foreignKey: 'Sponsor_ID' });
    }
  }
  Worker.init({
    Sponsor_ID: DataTypes.INTEGER,
    Passport_Number: DataTypes.STRING,
    National_ID: DataTypes.STRING,
    Full_Name: DataTypes.STRING,
    Nationality: DataTypes.STRING,
    Birth_Date: DataTypes.DATEONLY,
    Job_Title: DataTypes.STRING,
    Current_Status: DataTypes.STRING,
    NFC_UID: DataTypes.STRING,
    Primary_Card_Serial: DataTypes.STRING,
    Passport_Copy: DataTypes.TEXT,
    Health_Cert_Copy: DataTypes.TEXT,
    Residency_Copy: DataTypes.TEXT,
    Personal_Photo_Copy: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Worker',
  });
  return Worker;
};