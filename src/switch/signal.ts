import { Message, UrlLink } from 'wechaty';
import { MessageType } from 'wechaty-puppet';

import { auth, sample, checkSelf, noUseful } from '../middleware';
import logger from '../misc/logger';
import { pipe, wait } from '../misc/utils';
import { TalkerMgr } from './TalkerMgr';
import { URL_SUPPORT } from '../misc/constant';

const talkerMgr = new TalkerMgr();

export const signal = async (msg: Message) => {
  logger.info(`on message done: ${msg.toString()}`);

  try {
    const msgf = pipe([auth, sample, checkSelf, noUseful])(msg) as Message;

    const from: BSWechaty.TalkerUserInfo = {
      sysId: msgf.talker().id,
      userId: msgf.talker().weixin() ?? '-',
      nickname: msgf.talker().name(),
      province: msgf.talker().province() ?? '-',
      city: msgf.talker().city() ?? '-',
    };

    const talker = talkerMgr.getTalker(from);

    switch (msgf.type()) {
      case MessageType.Attachment:
        const af = await msgf.toFileBox();
        talker?.saveRichFile(af, msgf);

        break;

      case MessageType.Audio:
        const audio = await msgf.toFileBox();
        talker?.saveRichFile(audio, msgf);

        break;
      case MessageType.Image:
        const msgImg = await msgf.toImage();
        talker?.saveImage(msgImg);

        break;
      case MessageType.Text:
        talker?.question(msgf);
        break;

      // 链接卡片消息
      case MessageType.Url:
        const urlObj: UrlLink = await msgf.toUrlLink();

        const isLegal = URL_SUPPORT.some(el => urlObj.url().includes(el));

        if (!isLegal) {
          await msgf.talker().say(`正在开发开功能，尽情期待`);
          break;
        }

        const task: BSWechaty.TalkTask = {
          url: urlObj.url(),
          title: urlObj.title(),
          msgId: msgf.id,
          msgType: msgf.type(),
        };

        await talker?.saveRedis(task);
        await wait(Math.random() * 5000);
        await msgf
          .talker()
          .say(`已收藏 ${urlObj.title()} ${msgf.id}，请在2分钟后查询使用`);

        break;
      case MessageType.Video:
        const msgVd = await msgf.toFileBox();
        talker?.saveRichFile(msgVd, msgf);

        break;
      default:
        break;
    }
  } catch (e) {
    logger.warn('signal warn catch %s', (e as Error).message);
  }
};
