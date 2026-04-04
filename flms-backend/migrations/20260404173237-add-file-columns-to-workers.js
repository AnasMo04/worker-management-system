'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Workers', 'Passport_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Workers', 'Health_Cert_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Workers', 'Residency_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Workers', 'Personal_Photo_Copy', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workers', 'Passport_Copy');
    await queryInterface.removeColumn('Workers', 'Health_Cert_Copy');
    await queryInterface.removeColumn('Workers', 'Residency_Copy');
    await queryInterface.removeColumn('Workers', 'Personal_Photo_Copy');
  }
};
