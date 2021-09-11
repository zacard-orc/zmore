/**
 * Created by z30 on 21/8/14.
 */

import logger from './logger';
import redis from 'redis';
import { ev } from '../conf/confEnvv';

const redisCli = redis.createClient(
  (ev as any)[ev.ftype].redis_conf.port,
  (ev as any)[ev.ftype].redis_conf.host
);

redisCli.auth((ev as any)[ev.ftype].redis_conf.pass, function() {
  redisCli.select(2, function() {
    logger.debug('Redis has connected!');
  });
});

const prRedis = (cmd: string, argsArray: any[]) => {
  return new Promise((resolve, reject) => {
    redisCli.send_command(cmd, argsArray, function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

export { prRedis };
