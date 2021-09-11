/**
 * Created by z30 on 2018/4/13.
 */

import { Op, Sequelize } from 'sequelize';
import { ev } from '../conf/confEnvv';
import logger from './logger';

const seqInitConf: any = {
  host: (ev as any)[ev.ftype].db.nhost,
  port: (ev as any)[ev.ftype].db.nport,
  dialect: 'mysql',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  },
  // dialectOptions: {
  //   encrypt: true,
  // },
  pool: {
    max: 8,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+08:00',
  logging: (sql: string, mtime: string) => {
    logger.verbose(mtime + ',' + sql.substring(0, 800));
  },
  benchmark: true,
  operatorsAliases: {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col,
    $between: Op.between,
  },
};

// let seqInitConf2=  {
//   host: ev[ev.ftype].nhost,
//   port: ev[ev.ftype].nport,
//   dialect: 'mysql',
//   define: {
//     charset: 'utf8mb4',
//     collate: 'utf8mb4_general_ci',
//   },
//   pool: {
//     max: 8,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   },
//   timezone: '+08:00',
//   logging:(sql)=>{
//     loggerx.trace(sql.substring(0,800));
//   },
//   operatorsAliases: {
//     $eq: Op.eq,
//     $ne: Op.ne,
//     $gte: Op.gte,
//     $gt: Op.gt,
//     $lte: Op.lte,
//     $lt: Op.lt,
//     $not: Op.not,
//     $in: Op.in,
//     $notIn: Op.notIn,
//     $is: Op.is,
//     $like: Op.like,
//     $notLike: Op.notLike,
//     $and: Op.and,
//     $or: Op.or,
//     $any: Op.any,
//     $all: Op.all,
//     $values: Op.values,
//     $col: Op.col
//   }
// };

const sequelize = new Sequelize(
  (ev as any)[ev.ftype].db.ndbname,
  (ev as any)[ev.ftype].db.nuser,
  (ev as any)[ev.ftype].db.npwd,
  seqInitConf
);

seqInitConf.logging = () => {};
const sequelize_nolog = new Sequelize(
  (ev as any)[ev.ftype].db.ndbname,
  (ev as any)[ev.ftype].db.nuser,
  (ev as any)[ev.ftype].db.npwd,
  seqInitConf
);

export const ins_sql = {
  sequelize,
  sequelize_nolog,
};

// export default { sequelize, sequelize_nolog };
