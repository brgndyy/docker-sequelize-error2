const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {}; // 실제 데이터베이스가 이 db 객체와 연결됨

const Goal = require("./goal");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;

db.Goal = Goal.init(sequelize);

module.exports = db; // export 하기
