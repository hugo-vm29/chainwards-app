import { useEffect, useState } from 'react';
import { checkApplicationSession } from './helpers';

export const useRegisteredAccount = (disableRedirect = false) => {
  const [accountVerified, setAccountVerified] = useState(false);

  useEffect(() => {
    const appSession = checkApplicationSession();

    if (!appSession && !disableRedirect) {
      window.location.href = '/';
    }

    setAccountVerified(Boolean(appSession));
  }, [setAccountVerified, disableRedirect]);

  return accountVerified;
};
