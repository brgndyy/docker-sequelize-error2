# docker-sequelize-error2

### - 문제 상황

현재 docker를 이용해서 sequelize를 연결해주려고 하는데 계속 ENOTFOUND 에러가 발생하는 상황.

현재 docker run 을 통해서 mysql 컨테이너는 정상적으로 실행이 되는데,

express 컨테이너를 실행시키면 시퀄라이즈 연동과정에서 계속 에러가 나는 상황.

실제로 80번 포트가 실행중이라는 메세지는 나오는데, 그 후에 시퀄라이즈 연결하면서 에러가 발생.

- app.js

```javascript
const fs = require("fs");
const path = require("path");

const express = require("express");
const Sequelize = require("sequelize");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config({ path: "./env/mysql.env" });

const Goal = require("./models/goal");

const app = express();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    port: process.env.MYSQL_PORT,
    host: "mysql",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
```

- sequelize config.js

```javascript
require("dotenv").config({ path: "./env/mysql.env" });

module.exports = {
  development: {
    username: "root",
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: "mysql",
    dialect: "mysql",
    port: 3305,
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
```

- mysql 실행 명령어

```
docker run --rm --name mysql-container -e MYSQL_ROOT_PASSWORD=password -d -p 3305:3306 mysql:latest
```

- express 빌드

```
docker build -t goals-node .
```

- 그 후에 컨테이너 실행

```
docker run --name goals-backend --rm goals-node
```

- 에러 메세지

```
80 port is ready
HostNotFoundError [SequelizeHostNotFoundError]: getaddrinfo ENOTFOUND mysql
at ConnectionManager.connect (/app/node_modules/sequelize/lib/dialects/mysql/connection-manager.js:96:17)
at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
at async ConnectionManager.\_connect (/app/node_modules/sequelize/lib/dialects/abstract/connection-manager.js:222:24)
at async /app/node_modules/sequelize/lib/dialects/abstract/connection-manager.js:174:32
at async ConnectionManager.getConnection (/app/node_modules/sequelize/lib/dialects/abstract/connection-manager.js:197:7)
at async /app/node_modules/sequelize/lib/sequelize.js:305:26
at async Sequelize.authenticate (/app/node_modules/sequelize/lib/sequelize.js:457:5)
at async Sequelize.sync (/app/node_modules/sequelize/lib/sequelize.js:369:7) {
parent: Error: getaddrinfo ENOTFOUND mysql
```

"80 port is ready" 라는 메세지가 나오는거로 보아, express는 실행이 되는데, 그 후에 시퀄라이즈 연동에서 에러가 발생하는것 같음.

---

# 16:45 (업데이트)

[스택오버플로우 링크](https://stackoverflow.com/questions/77853438/enotfound-error-keeps-occurring-in-docker-and-sequelize) 에 질문글을 남겨서 답변을 받은대로 실행해봄

```
docker run --rm --name mysql-container --net=host  -e MYSQL_ROOT_PASSWORD=워크벤치비밀번호 -d mysql:latest
```

- app.js 시퀄라이즈 연동 부분 수정

```javascript
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_ROOT_PASSWORD,
  {
    port: process.env.MYSQL_PORT,
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize.authenticate();
```

- mysql.env 수정

```
MYSQL_DATABASE=mysql
MYSQL_ROOT_PASSWORD=워크벤치비밀번호
MYSQL_PASSWORD=워크벤치비밀번호
MYSQL_DATA_DIR=./mysql_data
MYSQL_USER=root
MYSQL_PORT=3306
```

- package.json 수정

```
{
  "name": "backend",
  "version": "1.0.0",
  "private": true,
  "description": "",
  "main": "n/a",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "errorTest",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.19.0",
    "express": "^4.17.1",
    "dotenv": "^16.3.2",
    "morgan": "^1.10.0",
    "mysql2": "^3.7.1",
    "sequelize": "^6.35.2",
    "sequelize-cli": "^6.6.2"
  }
}
```
