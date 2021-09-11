declare namespace BSWechaty {
  interface AppOptions {
    botName: string;
    token: string;
  }

  interface TalkerUserInfo {
    sysId: string; // 微信系统id
    userId: string; // 微信id（用户自己设定的）
    nickname: string; // 昵称
    // avatar?: string;
    province?: string; // 省
    city?: string; // 市
  }

  interface TalkInit {
    userinfo: TalkerUserInfo;
  }

  interface TalkTask {
    title: string;
    url: string;
    msgId: string;
    msgType: MessageType;
  }

  interface PolicyAction {
    type: PolicyActionType;
    name: string;
    [key: string]: string;
  }

  type TalkRedisTask = TalkTask & TalkerUserInfo;
}

declare namespace BSWModel {
  interface User {
    sysId: string;
    userId: string;
    nickname: string;
    province: string;
    city: string;
    email: string;
    cellno: string;
    ava: string;
    passwd: string;
    tips: string;
  }

  interface UserEn extends User {
    id: number;
    create_at: string;
    update_at: string;
  }

  interface ModelSet<T> {
    [key: string]: T;
  }

  interface RetUpdate {
    code: boolean;
    id?: number;
    errMsg?: string;
  }
}
