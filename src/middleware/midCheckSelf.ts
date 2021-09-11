import { Message } from 'wechaty';
import logger from '../misc/logger';

export const checkSelf = (message: Message) => {
  logger.info('[mid checkSelf]');

  // 碰到微信团队（安全），直接略过
  if (
    message.talker().id === 'weixin' ||
    message.talker().name() === '微信团队'
  ) {
    throw new Error('AGAINST SAFE');
  }

  if (!message.to()?.self()) {
    logger.warn(
      'NOTSELF %s %s',
      message.talker().name(),
      message.talker().weixin()
    );
    throw new Error('NOTSELF');
  }
  return message;
};
