import { Sequelize } from 'sequelize';


export const sequelize = new Sequelize(
  process.env.DB_NAME || 'heisenberg_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'saymyname',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;
