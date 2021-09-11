import fs from 'fs';
import path from 'path';

import sizeOf from 'image-size';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';

import logger from '../misc/logger';
import { prRedis } from '../misc/redis';
import { Image, Message } from 'wechaty';
import { ev } from '../conf/confEnvv';
import {
  md5hash,
  mkdirenh,
  wait,
  genRand,
  genSeqNo,
  sha256hash,
} from '../misc/utils';
import { FileBox } from 'wechaty/src/config';
import { UrlLink } from 'wechaty/src/user/url-link';
import { User } from './DBOps';

enum PolicyActionType {
  FN,
  TEXT,
}

const mailer = nodemailer.createTransport({
  host: 'smtp.tom.com',
  port: 25,
  secure: false,
  auth: {
    user: 'bookshelf@tom.com',
    pass: 'RRHtGHY1VLEAQQ',
  },
});

export class Talker {
  userinfo: BSWechaty.TalkerUserInfo;
  vcode: string | undefined; // 临时验证码
  email: string | undefined; // email地址
  cellno: string | undefined; // 手机号

  msgHis: any[];
  msgQHis: any[];
  prList: string[];
  prMap: Map<string, BSWechaty.PolicyAction>;

  [key: string]: any;

  constructor({ userinfo }: BSWechaty.TalkInit) {
    this.userinfo = userinfo;
    this.msgHis = [];
    this.msgQHis = [];
    this.prList = this.policy().prList;
    this.prMap = this.policy().prMap;
    this.vcode = undefined;
  }

  async answer(msg: Message, f: String | UrlLink) {
    logger.info('start answer %s %s', msg.talker(), f);
    if (typeof f === 'string') {
      await msg.talker().say(f);
    }
  }

  sendSms() {
    const randSms = Math.random()
      .toString()
      .slice(3, 8);

    const { nickname, sysId } = this.userinfo;
    logger.info('发送验证码 %s %s %s', nickname, sysId, randSms);

    return '已发送验证码';
  }

  async sendEmailVcode(msg: Message) {
    const rn = Math.random()
      .toString()
      .slice(3, 8);

    const { nickname, sysId } = this.userinfo;
    const q = msg.text();
    const addr = q.split('绑定邮箱')[1].trim();
    this.email = addr;

    try {
      logger.info('start to send %s', addr);
      const info = await mailer.sendMail({
        from: '藏经阁BookShelf <bookshelf@tom.com>',
        to: addr,
        subject: `藏经阁绑定验证码 ${dayjs().format('YYYY-MM-DD HH:mm')}`,
        html: `<h2>本次验证码为：${rn}</h2><h2>您也可以直接在微信输入：验证${rn}</h2>`,
      });

      this.vcode = rn;
      logger.info(
        '发送验证码 %s %s %s %s %s',
        nickname,
        sysId,
        rn,
        info.messageId,
        info.response
      );
    } catch (e) {
      logger.warn('发送邮箱验证码错误 %s %s', (e as Error).message);
    }

    await wait(genRand(1, 2));
    await this.answer(
      msg,
      `验证码已发送至您的邮箱\n` +
        `如未收到可以在新闻、订阅、其他收件箱里查阅下\n\n` +
        `收到验证码后，请输入如下格式：\n` +
        `验证XXXX\n\n` +
        `更多内容，请关注：https://xxx.ccc.com`
    );
  }

  async verifyVcode(msg: Message) {
    const { nickname, sysId } = this.userinfo;
    const { vcode } = this;
    const q = msg.text();
    const rn = q.split('验证')[1];

    if (!this.email) {
      await this.answer(msg, `验证对话不匹配 ${genSeqNo()}`);
      return;
    }

    if (rn !== vcode) {
      await this.answer(msg, `验证码不准确 ${genSeqNo()}`);
      this.vcode = undefined;
      return;
    }

    const user = new User();
    const ret = await user.addOneEnhance({
      ...this.userinfo,
      email: this.email,
      is_lock: 0,
    });
    logger.info('验证各验证码 %s %s %s %j', nickname, sysId, q, ret);
    if (!ret) {
      await this.answer(msg, `验证失败 ${genSeqNo()}`);
      return;
    }

    await this.answer(msg, `验证成功`);
    return;
  }

  async resetPasswd(msg: Message) {
    const { sysId } = this.userinfo;
    const q = msg.text();
    const newpd = sha256hash(q.split('重置密码')[1], sysId);

    const user = new User();
    const condx = { sysId };

    const dbu = await user.getOne(condx);
    if (!dbu) {
      await this.answer(
        msg,
        `用户未绑定任何信息。请先绑定邮箱或者手机号 ${genSeqNo()}`
      );
      return;
    }
    if (!dbu.dataValues.email && !dbu.dataValues.cellno) {
      await this.answer(
        msg,
        `用户未绑定任何信息，请先绑定邮箱或者手机号 ${genSeqNo()}`
      );
      return;
    }
    await user.updateOne({ passwd: newpd }, condx);
    await this.answer(msg, `重置成功`);
    return;
  }

  policy() {
    const prMap = new Map();
    prMap.set('绑定手机[\\d -]+$', {
      type: PolicyActionType.FN,
      name: 'sendSms',
    });
    prMap.set('绑定邮箱[\\w\\d\\\\._-]+@[\\w\\d]+\\.[\\w.]+$', {
      type: PolicyActionType.FN,
      name: 'sendEmailVcode',
    });
    prMap.set('验证[\\d]{4,6}$', {
      type: PolicyActionType.FN,
      name: 'verifyVcode',
    });
    prMap.set('重置密码.+$', {
      type: PolicyActionType.FN,
      name: 'resetPasswd',
    });

    const prList = Array.from(prMap.keys());

    return {
      prList,
      prMap,
    };
  }

  async question(msg: Message) {
    /*
            WechatifiedMessage {
          _events: [Object: null prototype] {},
          _eventsCount: 0,
          _maxListeners: undefined,
          id: '1885565804614649535',
          payload: {
            id: '1885565804614649535',
            timestamp: 1630506705,
            type: 7,
            fromId: 'wxid_x2mh18elf9xe22',
            mentionIdList: [],
            roomId: undefined,
            text: '123',
            toId: 'wxid_48qn03ijeqe022'
          },
          [Symbol(kCapture)]: false
        }
         */
    const q = msg.text();
    const { prList, prMap } = this;
    const hitIdx = prList.findIndex((el: string) => {
      const re = new RegExp(el);
      return re.test(q);
    });

    if (hitIdx < 0) {
      return;
    }
    const hitplicy = prList[hitIdx];
    const action = prMap.get(hitplicy);
    logger.info('hit policy %s %s', hitplicy, action);
    if (action && action.type === PolicyActionType.FN) {
      this.msgQHis.push(msg.text());
      await this[action.name](msg);
    }
  }

  async saveRedis(task: BSWechaty.TalkTask) {
    const rdtask = {
      ...task,
      ...this.userinfo,
    };
    const ret = await prRedis('lpush', ['wc', JSON.stringify(rdtask)]);
    logger.info(
      '[talker] %s queue to redis %s, ret = %s',
      this.userinfo.nickname,
      task.msgId,
      ret
    );
  }

  async saveImage(img: Image) {
    /*
             url: urlObj.url(),
              title: urlObj.title(),
              msgId: msgf.id,
              msgType: msgf.type(),
         */
    const hdImage = await img.hd();
    const ftype = path.extname(hdImage.name);

    const hdImageData = await hdImage.toBuffer();
    const upbase = (ev as any)[ev.ftype].upload_phy_path;
    const pathSec = (ev as any)[ev.ftype].upload_path_sec;

    const usermd5 = md5hash(this.userinfo.sysId, pathSec);
    const updir = path.resolve(
      upbase,
      `bsw/${this.userinfo.sysId.slice(0, 12)}_${usermd5}`
    );
    const imgMd5 = md5hash(hdImageData.toString());
    const full = `${updir}/${imgMd5}${ftype}`;
    mkdirenh(updir);

    if (fs.existsSync(full)) {
      logger.info('exist image %s, %s', hdImage.name, `${imgMd5}${ftype}`);
      return;
    }

    fs.promises
      .writeFile(full, hdImageData)
      .then(async () => {
        logger.info(
          'save image done %s, %s',
          hdImage.name,
          `${imgMd5}.${ftype}`
        );
        const dim = sizeOf(full);

        const rdtask = {
          url: full,
          name: hdImage.name,
          size: hdImageData.length,
          msgId: img.id,
          msgType: 6,
          ...dim,
          ...this.userinfo,
        };

        const ret = await prRedis('lpush', ['wc', JSON.stringify(rdtask)]);
        logger.info(
          '[talker] %s queue to redis %s, ret = %s',
          this.userinfo.nickname,
          img.id,
          ret
        );
      })
      .catch((e: Error) => {
        logger.warn('write image error %s', e);
      });
  }

  async saveRichFile(vd: FileBox, raw: Message) {
    // console.log(vd);
    // console.log(raw);
    /*
        .text()
        <?xml version="1.0"?>
    <msg>
        <videomsg aeskey="6caa2023235a3284a7b1a0cf716059ae" cdnthumbaeskey="6caa2023235a3284a7b1a0cf716059ae" cdnvideourl="3074020100046d306b02010002048453599502033d120002042ffff46d0204612f615a0446777869645f3438716e3033696a6571653032323132375f313633303439353036365f37666563656234632d303863322d346338302d383439312d3032373161646266316434340204011400040201000400" cdnthumburl="3074020100046d306b02010002048453599502033d120002042ffff46d0204612f615a0446777869645f3438716e3033696a6571653032323132375f313633303439353036365f37666563656234632d303863322d346338302d383439312d3032373161646266316434340204011400040201000400" length="250236" playlength="3" cdnthumblength="6632" cdnthumbwidth="138" cdnthumbheight="240" fromusername="wxid_x2mh18elf9xe22" md5="799443d909cc3b9444c37daf8491b0ee" newmd5="" isad="0" />
    </msg>

       .raw
        FileBox {
          name: 'message-3059499519946556175-video.mp4',
          boxType: 4,
          mimeType: 'video/mp4',
          buffer: <Buffer 00 00 00 20 66 74 79 70 69 73 6f 6d 00 00 02 00 69 73 6f 6d 69 73 6f 32 61 76 63 31 6d 70 34 31 00 00 10 be 6d 6f 6f 76 00 00 00 6c 6d 76 68 64 00 00 ... 246808 more bytes>
        }
         */
    const ftype = path.extname(vd.name);
    const rhData = await vd.toBuffer();
    const upbase = (ev as any)[ev.ftype].upload_phy_path;
    const pathSec = (ev as any)[ev.ftype].upload_path_sec;

    const usermd5 = md5hash(this.userinfo.sysId, pathSec);
    const updir = path.resolve(
      upbase,
      `bsw/${this.userinfo.sysId.slice(0, 12)}_${usermd5}`
    );
    const vdMd5 = md5hash(rhData.toString());
    const full = `${updir}/${vdMd5}${ftype}`;
    mkdirenh(updir);

    if (fs.existsSync(full)) {
      logger.info('exist rich %s, %s', vd.name, `${vdMd5}${ftype}`);
      return;
    }

    fs.promises
      .writeFile(full, rhData)
      .then(async () => {
        logger.info('save roich done %s, %s', vd.name, `${vdMd5}${ftype}`);

        const rdtask = {
          url: full,
          name: vd.name,
          size: rhData.length,
          msgId: raw.id,
          msgType: raw.type(),
          ...this.userinfo,
        };

        const ret = await prRedis('lpush', ['wc', JSON.stringify(rdtask)]);
        logger.info(
          '[talker] %s queue to redis %s, ret = %s',
          this.userinfo.nickname,
          raw.id,
          ret
        );
      })
      .catch((e: Error) => {
        logger.warn('write image error %s', e);
      });
  }

  toJson() {
    logger.info('[talker] %s', this.userinfo.nickname);
  }

  toString() {
    logger.info('[talker] %s', this.userinfo.nickname);
  }
}
