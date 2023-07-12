// import { Buffer } from 'buffer';
import Cookies from 'js-cookie';
import { SESSION_COOKIE } from '../utils/constants';
import * as types from './types';

//const { cookieDomain } = window.config;

const cookieConfig = window.location.protocol.includes('https')
  ? {
      //domain: cookieDomain,
      sameSite: 'strict' as const,
      secure: true,
      expires: 1,
    }
  : {
      //domain: cookieDomain,
      expires: 1,
    };

export const setApplicationSession = (data: types.FindAccountResponse) => {
  const accountInfo = {
    id: data._id,
    displayName: data.displayName,
    wallet: data.wallet.address,
  };

  const valueToStore = btoa(JSON.stringify(accountInfo));
  Cookies.set(SESSION_COOKIE, valueToStore, cookieConfig);
};

export const checkApplicationSession = () => {
  //|| isExpired(sessionCookie)
  const sessionCookie = Cookies.get(SESSION_COOKIE);

  if (!sessionCookie) {
    Cookies.remove(SESSION_COOKIE);
    return null;
  }

  return {
    sessionCookie,
  };
};

export function clearApplicationSession() {
  Cookies.remove(SESSION_COOKIE);
  localStorage.clear();
}
