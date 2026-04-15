'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentsStore extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DocumentsStore.belongsTo(models.Worker, { foreignKey: 'Worker_ID' });
      DocumentsStore.belongsTo(models.Sponsor, { foreignKey: 'Sponsor_ID' });
    }
  }
  DocumentsStore.init({
    Worker_ID: DataTypes.INTEGER,
    Sponsor_ID: DataTypes.INTEGER,
    Doc_Type: DataTypes.STRING,
    Doc_Number: DataTypes.STRING,
    Issue_Date: DataTypes.DATEONLY,
    Expiry_Date: DataTypes.DATEONLY,
    File_Path: DataTypes.TEXT,
    Checksum: DataTypes.STRING,
    Uploaded_By: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'DocumentsStore',
  });
  return DocumentsStore;
};