import szo from '../../misc/seqDefine';
import Abs from './Abs';
import logger from '../../misc/logger';

export class User extends Abs {
  tbname: string;
  constructor() {
    super();
    this.tbname = `bsw_${this.constructor.name.toLowerCase()}`;
  }

  /*单纯地添加一条记录*/
  async addOnePure(obj: any) {
    const { tbname } = this;
    try {
      return (szo as BSWModel.ModelSet<any>)[tbname].create(obj);
    } catch (e) {
      logger.warn('%s addOnePure %s', e);
    }
  }

  /*带自动判断能力地添加一条记录 replace into*/
  async addOneEnhance(obj: any): Promise<BSWModel.RetUpdate> {
    const condx = { sysId: obj.sysId };
    const ret = await this.getOne(condx);
    if (!ret) {
      const ret = await this.addOnePure(obj);
      return {
        code: true,
        id: ret.dataValues.id,
      };
    }

    return this.updateOne(obj, condx)
      .then(() => {
        return {
          code: true,
          id: ret.dataValues.id,
        };
      })
      .catch((e: Error) => {
        return {
          code: true,
          errMsg: e.message,
        };
      });
  }

  /*更新数据*/
  async updateOne(obj: any, cond: any) {
    const { tbname } = this;
    return (szo as BSWModel.ModelSet<any>)[tbname].update(
      {
        ...obj,
      },
      {
        where: {
          ...cond,
        },
      }
    );
  }

  /*删除数据*/
  // @ts-ignore
  async delOne(obj: any) {
    const { tbname } = this;
    await (szo as BSWModel.ModelSet<any>)[tbname].update({}, {});
  }

  /*查找一条*/
  async getOne(cond: any): Promise<any> {
    const { tbname } = this;
    return (szo as BSWModel.ModelSet<any>)[tbname]
      .findOne({
        where: {
          ...cond,
        },
      })
      .then((dbres: any) => {
        return dbres;
      })
      .catch((e: Error) => {
        logger.info('%s getOne error %s', this, e.message);
      });
  }

  /*查找多条*/
  // @ts-ignore
  async getMore(cond) {
    const { tbname } = this;
    await (szo as BSWModel.ModelSet<any>)[tbname].findOne({
      where: {},
    });
  }

  /*获取所有*/
  // @ts-ignore
  async getFull(cond) {
    const { tbname } = this;
    await (szo as BSWModel.ModelSet<any>)[tbname].findOne({
      where: {},
    });
  }
}
