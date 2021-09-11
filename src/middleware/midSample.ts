import { Message } from 'wechaty';
import logger from '../misc/logger';

export const sample = (message: Message) => {
  logger.info('[mid sample]');
  return message;
};
