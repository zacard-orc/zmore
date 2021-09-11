import { Message } from 'wechaty';
import logger from '../misc/logger';
import { MessageType } from 'wechaty-puppet';

export const noUseful = (message: Message) => {
  logger.info('[mid noUseful]');

  const tips = {
    NO_FUNC: '我们正在开发开功能，尽情期待',
    NO_SUPPORT: '亲，暂不能支持该功能',
  };

  let block = false;

  switch (message.type()) {
    case MessageType.ChatHistory:
      message
        .talker()
        .say(tips['NO_FUNC'])
        .then();
      block = true;
      break;
    case MessageType.MiniProgram:
      message
        .talker()
        .say(tips['NO_FUNC'])
        .then();
      block = true;
      break;
    case MessageType.GroupNote:
      message
        .talker()
        .say(tips['NO_FUNC'])
        .then();
      block = true;
      break;
    case MessageType.Recalled:
      message
        .talker()
        .say(tips['NO_FUNC'])
        .then();
      block = true;
      break;
    case MessageType.Emoticon:
      message
        .talker()
        .say(tips['NO_FUNC'])
        .then();
      block = true;
      break;
    case MessageType.Location:
      message
        .talker()
        .say(tips['NO_SUPPORT'])
        .then();
      block = true;
      break;
    default:
      break;
  }

  if (block) {
    throw new Error('no useful');
  }
  return message;
};
