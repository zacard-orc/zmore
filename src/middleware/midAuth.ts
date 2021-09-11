import { Message } from 'wechaty';
import logger from '../misc/logger';

export const auth = (message: Message) => {
  logger.info('[mid auth]');
  return message;
};
