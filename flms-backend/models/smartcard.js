'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SmartCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SmartCard.init({
    Card_Serial_No: DataTypes.STRING,
    Worker_ID: DataTypes.INTEGER,
    NFC_Chip_ID: DataTypes.STRING,
    Encrypted_Payload: DataTypes.TEXT,
    Encryption_Version: DataTypes.STRING,
    Issue_Date: DataTypes.DATEONLY,
    Expiry_Date: DataTypes.DATEONLY,
    Is_Active: DataTypes.BOOLEAN,
    Blacklist_Reason: DataTypes.TEXT,
    Issued_By: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SmartCard',
  });
  return SmartCard;
};