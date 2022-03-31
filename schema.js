import { gql } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'
import { PubSub, withFilter } from 'graphql-subscriptions'

const pubsub = new PubSub()

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
      return await User.create({ name: user.name, status: user.status, age: user.age, pwd: pwdHash });
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

      return await _user.save()
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
      return await User.destroy({
        where: {
          id: args.userId
        }
      })
    }
  }
}

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

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

export { typeDefs, resolvers, schema }