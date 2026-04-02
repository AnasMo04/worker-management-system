'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Device.init({
    User_ID: DataTypes.INTEGER,
    Device_Type: DataTypes.STRING,
    Model: DataTypes.STRING,
    OS_Version: DataTypes.STRING,
    Last_Sync_Time: DataTypes.DATE,
    Is_Active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};