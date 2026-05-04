'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Workers', 'Native_Language', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'Nationality'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Workers', 'Native_Language');
  }
};
