"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("areas", {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
      name: { type: Sequelize.STRING(120), allowNull: true },
      lat1: { type: Sequelize.DOUBLE, allowNull: false },
      lon1: { type: Sequelize.DOUBLE, allowNull: false },
      lat2: { type: Sequelize.DOUBLE, allowNull: false },
      lon2: { type: Sequelize.DOUBLE, allowNull: false },
      validFrom: { type: Sequelize.DATE, allowNull: true },
      validTo: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("NOW()") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("NOW()") }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("areas");
  }
};
