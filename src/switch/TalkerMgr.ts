import logger from '../misc/logger';
import { Talker } from './Talker';

export class TalkerMgr {
  talkerMap!: Map<string, Talker>;
  static instance: TalkerMgr;

  constructor() {
    if (!TalkerMgr.instance) {
      TalkerMgr.instance = this;
      this.talkerMap = new Map();
    }
    return TalkerMgr.instance;
  }

  addTalker(userinfo: BSWechaty.TalkerUserInfo, inst: Talker) {
    if (!this.talkerMap.get(userinfo.sysId)) {
      this.talkerMap.set(userinfo.sysId, inst);
      logger.info('add talker %s', userinfo.nickname);
    }
  }

  getTalker(userinfo: BSWechaty.TalkerUserInfo): Talker | undefined {
    if (this.talkerMap.get(userinfo.sysId)) {
      return this.talkerMap.get(userinfo.sysId);
    }

    const talker = new Talker({
      userinfo,
    });

    this.addTalker(userinfo, talker);

    return talker;
  }

  delTalker(userinfo: BSWechaty.TalkerUserInfo) {
    this.talkerMap.delete(userinfo.sysId);
  }

  toJson() {
    logger.info('[talker] length = %d', this.talkerMap.size);
  }

  toString() {
    logger.info('[talkerMgr] length = %d', this.talkerMap.size);
  }
}
