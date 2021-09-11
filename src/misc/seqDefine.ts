/**
 * Created by z30 on 2018/4/13.
 * sql实现-插入
 co(function* () {
    let userins = yield UserDef.create({
      cellno: '138123001311',
      name: '小明1',
      wx_openid:'0'
    });
    console.logs(userins.get({'plain': true}));
  }).catch(function(e) {
    console.logs(e);
  });

 sql实现-更新
 co(function* () {
  let userins = yield UserDef.update(
    {'name':'34bb33ss'},
    {'where':{'id':{[Op.eq]:1}} }
  ).then(function (result) {
    console.logs(result);
  })

  }).catch(function(e) {
  console.logs(e);
});

 sql实现-查询
 co(function* () {
  let userins = yield UserDef.findAll(
    {
      'attributes': ['name','id','cellno'],
      'where':{'id':1},
      raw: true
    }
  );
  console.logs(userins)

  }).catch(function(e) {
  console.logs(e);
});

 */

import { DataTypes } from 'sequelize';
import moment from 'moment';

import { ins_sql } from './seqBase.js';

const commonFieldSet = {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  is_lock: {
    type: DataTypes.TINYINT,
  },
  create_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get(): any {
      return moment((this as any).getDataValue('create_at'))
        .utcOffset(+8 * 60)
        .format('YYYY-MM-DD HH:mm:ss');
    },
  },
  update_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get(): any {
      return moment((this as any).getDataValue('update_at'))
        .utcOffset(+8 * 60)
        .format('YYYY-MM-DD HH:mm:ss');
    },
  },
};

const commonTableOptions = {
  freezeTableName: true,
  timestamps: false,
};

export default {
  bsw_user: ins_sql.sequelize.define(
    'bsw_user',
    {
      sysId: { type: DataTypes.STRING(32) },
      userId: { type: DataTypes.STRING(32) },
      nickname: { type: DataTypes.STRING(64) },
      province: { type: DataTypes.STRING(64) },
      city: { type: DataTypes.STRING(64) },
      email: { type: DataTypes.STRING(64) },
      cellno: { type: DataTypes.STRING(64) },
      ava: { type: DataTypes.STRING(64) },
      passwd: { type: DataTypes.STRING(64) },
      tips: { type: DataTypes.STRING(64) },
      ...commonFieldSet,
    },
    {
      ...commonTableOptions,
    }
  ),
};
