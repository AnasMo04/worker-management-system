'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentsStores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Worker_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Workers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      Doc_Type: {
        type: Sequelize.STRING
      },
      Doc_Number: {
        type: Sequelize.STRING
      },
      Issue_Date: {
        type: Sequelize.DATEONLY
      },
      Expiry_Date: {
        type: Sequelize.DATEONLY
      },
      File_Path: {
        type: Sequelize.TEXT
      },
      Checksum: {
        type: Sequelize.STRING
      },
      Uploaded_By: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DocumentsStores');
  }
};