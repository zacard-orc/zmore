import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import uuid from 'uuid';

export const isDev: boolean = process.env.NODE_ENV === 'development';

export const wait = (tmout: number): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('ok');
    }, tmout);
  });
};

export const uuidv4 = () => {
  return uuid.v4();
};

export const pipe = (argsFn: Array<any>) => {
  return (payload: any) => {
    return argsFn.reduce((prev: any, elfn: any) => {
      return elfn(prev);
    }, payload);
  };
};

export const genSeqNo = () => {
  return Date.now() + uuidv4().slice(0, 4);
};

export const genRand = (lower: number, upper: number) => {
  return Math.floor(Math.random() * (upper - lower)) + lower;
};

export const chooseOneFromArray = <T>(someArray: T[]) => {
  return someArray[genRand(0, someArray.length)];
};

export const mkdirenh = (dirname: string): boolean => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirenh(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    } else {
      return false;
    }
  }
};

export const md5hash = (plain: string, sec: string = '') => {
  /* md5 hash */
  const Buffer = require('buffer').Buffer;
  const buf = Buffer.from(plain + sec);
  const str = buf.toString('binary');
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex');
};

export const sha256hash = (plain: string, sec: string = '') => {
  const hash = crypto.createHash('sha256');
  return hash.update(plain + sec).digest('hex');
};
