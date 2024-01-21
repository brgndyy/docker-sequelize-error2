const Sequelize = require("sequelize");

module.exports = class Goal extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        text: {
          type: Sequelize.STRING,
        },
      },
      {
        sequelize,
        modelName: "Goals",
        tableName: "goals",
      }
    );
  }
  static associate(db) {}
};
