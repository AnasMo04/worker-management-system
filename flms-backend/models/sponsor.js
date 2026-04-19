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
    Sponsor_Name: DataTypes.STRING, // Used as Entity Name
    Phone: DataTypes.STRING,
    Email: DataTypes.STRING,
    Address: DataTypes.TEXT,
    Commercial_Reg_Copy: DataTypes.TEXT,
    Tax_Cert_Copy: DataTypes.TEXT,
    License_Copy: DataTypes.TEXT,
    Auth_Letter_Copy: DataTypes.TEXT,
    Owner_Name: DataTypes.STRING,
    Owner_National_ID: DataTypes.STRING,
    Owner_Phone: DataTypes.STRING,
    Owner_Email: DataTypes.STRING,
    Owner_Photo: DataTypes.TEXT,
    Identity_Copy: DataTypes.TEXT,
    Region: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Sponsor',
  });
  return Sponsor;
};