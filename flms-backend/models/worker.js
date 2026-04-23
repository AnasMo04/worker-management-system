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
    Passport_Number: DataTypes.STRING, // Document Number
    National_ID: DataTypes.STRING,
    Full_Name: DataTypes.STRING,
    Nationality: DataTypes.STRING,
    Birth_Date: DataTypes.DATEONLY,
    Residence_Address: DataTypes.STRING, // عنوان السكن
    Current_Status: {
      type: DataTypes.STRING,
      defaultValue: 'نشط'
    },
    NFC_UID: DataTypes.STRING,
    Primary_Card_Serial: DataTypes.STRING,
    Passport_Copy: DataTypes.TEXT, // Document Copy
    Health_Cert_Copy: DataTypes.TEXT,
    Residency_Copy: DataTypes.TEXT,
    Personal_Photo_Copy: DataTypes.TEXT,
    Category: DataTypes.STRING, // Worker, Student, Dependent
    Document_Type: DataTypes.STRING, // Passport, Consular ID, etc.
    Health_Cert_Expiry: DataTypes.DATEONLY,
    Freelance: DataTypes.BOOLEAN,
    Family_ID: DataTypes.STRING,
    Relationship: DataTypes.STRING, // Spouse, Child, Parent
    Gender: DataTypes.STRING, // Male / Female
    fingerprint_template: DataTypes.TEXT,
    fingerprint_image: DataTypes.TEXT,
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Worker',
  });
  return Worker;
};