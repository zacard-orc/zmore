export default abstract class Abs {
  /*单纯地添加一条记录*/
  abstract addOnePure(obj: any): void;

  /*带自动判断能力地添加一条记录 replace into*/
  abstract addOneEnhance(obj: any, cond: any): Promise<BSWModel.RetUpdate>;

  /*更新了一条记录 replace into*/
  abstract updateOne(obj: any, cond: any): void;

  /*删除一条记录*/
  abstract delOne(obj: any): void;

  /*查询一条记录*/
  abstract getOne(cond: any): void;

  /*查询多条记录*/
  abstract getMore(cond: any): void;

  /*查询所有记录*/
  abstract getFull(cond: any): void;
}
