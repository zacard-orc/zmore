import { PuppetPadlocal } from 'wechaty-puppet-padlocal';
import { Contact, Message, ScanStatus, Wechaty } from 'wechaty';

import logger from './misc/logger';
import { signal } from './switch/signal';

export const StartApp = ({ botName, token }: BSWechaty.AppOptions) => {
  return new Promise(resolve => {
    const puppet = new PuppetPadlocal({
      token,
    });

    const bot = new Wechaty({
      name: botName,
      puppet,
    })
      .on('scan', (qrcode: string, status: ScanStatus) => {
        if (status === ScanStatus.Waiting && qrcode) {
          const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
          ].join('');

          logger.info(
            `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`
          );

          require('qrcode-terminal').generate(qrcode, { small: true }); // show qrcode on console
        } else {
          logger.info(`onScan: ${ScanStatus[status]}(${status})`);
        }
      })

      .on('login', (user: Contact) => {
        logger.info(`${user} login`);
      })

      .on('logout', (user: Contact, reason: string) => {
        logger.info(`${user} logout, reason: ${reason}`);
      })

      .on('message', async (message: Message) => {
        signal(message);
      })

      .on('error', error => {
        logger.error('on error: %s', error.stack);
      });

    bot.start().then(() => {
      logger.info(`${botName} started`);
      resolve('ok');
    });
  });
};
