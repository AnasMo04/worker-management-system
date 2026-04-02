'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuditTrail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AuditTrail.init({
    Actor_ID: DataTypes.INTEGER,
    Action_Type: DataTypes.STRING,
    Target_Ref: DataTypes.STRING,
    Timestamp: DataTypes.DATE,
    Details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AuditTrail',
  });
  return AuditTrail;
};