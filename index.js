import { ApolloServer, gql, PubSub } from 'apollo-server'

import mysql from 'mysql2'
import Sequelize from 'sequelize'
// op(Operators) => https://sequelize.org/master/manual/model-querying-basics.html
import bcrypt from 'bcrypt'


const DataTypes = Sequelize.DataTypes
const Op = DataTypes.Op

const pubsub = new PubSub()

const mysqlConfig = {
  dbname: 'test',
  uname: 'root',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
}

var sequelize = new Sequelize(
  mysqlConfig.dbname,
  mysqlConfig.uname,
  mysqlConfig.upwd, {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
    pool: mysqlConfig.pool
  }
);

async function init () {
  // pwd加密
  // const pwd = 'mypwd'
  // const pwdHash = await bcrypt.hash(pwd, 10)
  // console.log(pwd)
  // console.log(await bcrypt.compare(pwd, pwdHash))
  // console.log(await bcrypt.compare('mypwd2', pwdHash))

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  const User = sequelize.define('User', {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // get() {
      //   // 類似vuex的getters
      //   const rawValue = this.getDataValue('name');
      //   return rawValue ? rawValue + '_getter_chuchu' : null;
      // },
      // async set(value) {
      //   // 如果不慎存擋時，名稱包含了_getter_chuchu的話就replace掉
      //   this.setDataValue('name', value.replace('_getter_chuchu', ''));
      //   // save 不可以放在setter裡面，這樣如果用 create就會被觸發，導致存成兩個
      //   // await this.save()
      // }
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    age: DataTypes.INTEGER,
    pwd: DataTypes.STRING(60)
  }, {
    // Other model options go here
  });

  User === sequelize.models.User;

  // 建立table
  // await User.sync(); // 如果已經有表就什麼都不做
  // await User.sync({ force: true }); // 刪掉舊的建立新的
  await User.sync({ alter: true }); // 如果已經有表還會匹配欄位是否符合去做修改
  // sequelize.SYNC({ ... }) 對所有表都做

  // 砍掉table
  // User.drop()
  // sequelize.drop() 砍掉所有table

  // 新增、儲存、編輯、刪除
  // const user = User.build({ name: "Bob", status: 0, age: 20, pwd: pwdHash });
  // await user.save();
  // await user.reload();
  // await user.destroy();

  // 新增並儲存
  // const user = await User.create({ name: "Boss", status: 0, age: 20, pwd: pwdHash });

  // 一次新增儲存好多筆
  // await User.bulkCreate([
  //   { name: 'Lily Chouchou', status: 0, age: 2, pwd: pwdHash },
  //   { name: 'JJ Lin', status: 0, age: 4, pwd: pwdHash },
  //   { name: 'Aiko', status: 0, age: 10, pwd: pwdHash }
  // ]);

  // getter/setter例：撈出所有，對第一筆做修改
  // const users = await User.findAll()
  // console.log(users[0].name)
  // users[0].name = 'Janet'
  // await users[0].save()

  // Delete every named begin "Boss" item
  // await User.destroy({
  //   where: {
  //     name: {
  //       [Op.like]: 'Boss%'
  //     }
  //   }
  // })

  // Delete every item named "yyooyoyo"
  // await User.destroy({
  //   where: {
  //     name: 'yyooyoyo'
  //   }
  // })

  // Delete every selected items
  // const bosses = await User.findAll({
  //   where: {
  //     name: {
  //       [Op.like]: 'Boss%'
  //     }
  //   }
  // })
  // bosses.forEach(boss => {
  //   boss.destroy()
  // })



  // select
  // const user2 = await User.findByPk(2);
  // await user2.destroy();

  // 撈全部
  // console.log(await User.findAll())

  // 不重複的age資料（撈出來的資料只有age欄位）
  // console.log(await User.findAll({ attributes: ['age'], group: ['age'] }))

  // 以age欄位分組的count資料（撈出來的資料只有age & count欄位）
  // console.log(await User.count({ group: ['age'] }))

  // 從上而下（舊到新）只取一比
  // console.log(await User.findOne({ where: { name: 'Bob' } }))

  // 找一比，若沒有的話就建立
  // console.log(await User.findOrCreate({
  //   where: {
  //     name: 'Bob2',
  //     status: 0,
  //     age: 24,
  //     pwd: pwdHash
  //   },
  //   defaults: {
  //     // age: 12
  //   }
  // }))

  // 找出全部或匹配條件的項目，並計算數量
  // console.log(await User.findAndCountAll({
  //   where: {
  //     // id: [1,2,3],
  //     name: {
  //       [Op.like]: 'Bo%'
  //     }
  //   },
  //   offset: 10,
  //   limit: 2
  // }))

  // 計算全部或匹配條件的項目的數量
  // console.log(await User.count({
  //   where: {
  //     // id: [1,2,3],
  //     name: {
  //       [Op.like]: 'Bo%'
  //     }
  //   }
  // }))

  // 計算最多、最少、加總
  // console.log(await User.max('age'));
  // console.log(await User.max('age', { where: { age: { [Op.lt]: 20 } } }));
  // console.log(await User.min('age'));
  // console.log(await User.min('age', { where: { age: { [Op.gt]: 5 } } }));
  // console.log(await User.sum('age'));
  // console.log(await User.sum('age', { where: { age: { [Op.gt]: 5 } } }));



  // apollo init

  // Type definitions 定義資料的「形狀」，
  // 並指定從 GraphQL server 獲取的方式。
  const typeDefs = gql`
    # GraphQL 的註解使用 hash（#）符號來定義

    # Queries
    type User {
      id: ID
      name: String
      age: Int
      status: Int
    }

    type Ages {
      age: Int
      count: Int
    }

    # 「Query」型別是所有 GraphQL 查詢的 root。
    type Query {
      users: [User]
      ages: [Ages]
    }

    # Mutations
    input NewUser {
      name: String
      age: Int
      status: Int
      pwd: String
    }

    # Mutations
    input UpdateUser {
      id: ID
      name: String
      age: Int
      status: Int
    }

    # 「Mutation」型別是所有 GraphQL 編輯的 root。
    type Mutation {
      AddUser(user: NewUser): User
      EditUser(user: UpdateUser): User
      # RemoveUser(user: UpdateUser): User!
      RemoveUser(userId: Int): User!
    }

    # 「Subscription」型別是所有 GraphQL 訂閱的 root。
    type Subscription {
      UsersUpdated: User
    }
  `;

  // Resolvers 定義從 schema 獲取 type 的方式，
  const resolvers = {
    Query: {
      users: async () => {
        return await User.findAll()
      },
      ages: async () => {
        return await User.count({ group: ['age'] })
      }
    },

    Mutation: {
      AddUser: async (parent, args) => {
        const user = args.user
        const pwdHash = await bcrypt.hash(user.pwd, 10)
        const req = await User.create({ name: user.name, status: user.status, age: user.age, pwd: pwdHash });

        pubsub.publish('USER_UPDATED', {
          UsersUpdated: {
            id: req.id,
            name: req.name,
            status: req.status,
            age: req.age
          }
        })

        return req
      },
      EditUser: async (parent, args) => {
        const user = args.user
        const _user = await User.findOne({
          where: {
            id: user.id
          }
        });

        _user.name = user.name
        _user.age = user.age
        _user.status = user.status

        const req = await _user.save()

        pubsub.publish('USER_UPDATED', {
          UsersUpdated: {
            id: req.id,
            name: req.name,
            status: req.status,
            age: req.age
          }
        })

        return req
      },
      // RemoveUser: async (parent, args) => {
      //   const user = args.user
      //   return await User.destroy({
      //     where: {
      //       id: user.id
      //     }
      //   });
      // }
      RemoveUser: async (parent, args) => {
        const req = await User.destroy({
          where: {
            id: args.userId
          }
        })

        pubsub.publish('USER_UPDATED', {
          users: await User.findAll()
        })

        return req
      }
    },

    Subscription: {
      UsersUpdated: {
        // More on pubsub below
        subscribe: () => pubsub.asyncIterator(['USER_UPDATED'])
      }
    }
  };

  // playground examples

  // query example
  /*
  query GetUsersAndAges {
    users {
      name
      age
      status
    }
    ages {
      age
      count
    }
  }
  */

  // mutation example
  /*
  mutation AddAUser($usr: NewUser) {
    AddUser(user: $usr) {
      name
      age
      status
    }
  }

  variables:
  {
    "usr":{
      "name": "yyooyoyo",
      "age": 24,
      "status": 0,
      "pwd": "123456"
    }
  }
  */

  // 基本上來說，ApolloServer 可以透過傳入 type definitions（typeDefs）
  // 及 resolvers 來管理獲取這些資料的型別。
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        // console.log(connectionParams.Authorization)
        // if (connectionParams.authToken) {
        //   return validateToken(connectionParams.authToken)
        //     .then(findUser(connectionParams.authToken))
        //     .then(user => {
        //       return {
        //         currentUser: user,
        //       };
        //     });
        // }

        // throw new Error('Missing auth token!');
      }
    }
  });

  // `listen` method 啟動 web-server。現有的 apps 可以
  // 使用 middleware options，我們將在晚點討論。
  server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
  });
}

init()