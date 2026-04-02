'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FieldLogs', {
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
      Card_Serial_No: {
        type: Sequelize.STRING
      },
     Officer_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Device_ID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Devices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      Scan_Time: {
        type: Sequelize.DATE
      },
      Local_Timestamp: {
        type: Sequelize.DATE
      },
      GPS_Lat: {
        type: Sequelize.DECIMAL
      },
      GPS_Lon: {
        type: Sequelize.DECIMAL
      },
      Location_Text: {
        type: Sequelize.TEXT
      },
      Result: {
        type: Sequelize.STRING
      },
      Note: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('FieldLogs');
  }
};