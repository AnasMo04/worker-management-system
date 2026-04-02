'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SmartCards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Card_Serial_No: {
        type: Sequelize.STRING
      },
      Worker_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Workers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // لو انمسح العامل، تنمسح بطاقته تلقائياً
      },
      NFC_Chip_ID: {
        type: Sequelize.STRING
      },
      Encrypted_Payload: {
        type: Sequelize.TEXT
      },
      Encryption_Version: {
        type: Sequelize.STRING
      },
      Issue_Date: {
        type: Sequelize.DATEONLY
      },
      Expiry_Date: {
        type: Sequelize.DATEONLY
      },
      Is_Active: {
        type: Sequelize.BOOLEAN
      },
      Blacklist_Reason: {
        type: Sequelize.TEXT
      },
      Issued_By: {
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
    await queryInterface.dropTable('SmartCards');
  }
};