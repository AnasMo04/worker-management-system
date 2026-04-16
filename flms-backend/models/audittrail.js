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
      AuditTrail.belongsTo(models.User, { foreignKey: 'Actor_ID' });
    }
  }
  AuditTrail.init({
    Actor_ID: DataTypes.INTEGER,
    Action_Type: DataTypes.STRING,
    Target_Ref: DataTypes.STRING,
    Target_Name: DataTypes.STRING,
    Description: DataTypes.TEXT,
    Timestamp: DataTypes.DATE,
    Details: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AuditTrail',
  });
  return AuditTrail;
};