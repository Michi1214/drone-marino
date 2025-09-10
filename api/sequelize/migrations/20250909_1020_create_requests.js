"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("requests", {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      boatCode: { type: Sequelize.STRING(10), allowNull: false },
      startAt: { type: Sequelize.DATE, allowNull: false },
      endAt: { type: Sequelize.DATE, allowNull: false },
      route: { type: Sequelize.JSONB, allowNull: false },
      status: { type: Sequelize.ENUM("pending", "accepted", "rejected", "cancelled"), allowNull: false, defaultValue: "pending" },
      rejectionReason: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("NOW()") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("NOW()") }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("requests");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_requests_status";');
  }
};
