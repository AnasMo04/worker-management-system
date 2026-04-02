'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FieldLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FieldLog.init({
    Worker_ID: DataTypes.INTEGER,
    Card_Serial_No: DataTypes.STRING,
    Officer_ID: DataTypes.INTEGER,
    Device_ID: DataTypes.INTEGER,
    Scan_Time: DataTypes.DATE,
    Local_Timestamp: DataTypes.DATE,
    GPS_Lat: DataTypes.DECIMAL,
    GPS_Lon: DataTypes.DECIMAL,
    Location_Text: DataTypes.TEXT,
    Result: DataTypes.STRING,
    Note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'FieldLog',
  });
  return FieldLog;
};