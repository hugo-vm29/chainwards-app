import { useEffect, useState } from 'react';
import { checkApplicationSession } from '../utils/auth';

export const useRegisteredAccount = (disableRedirect = false) => {
  const [accountVerified, setAccountVerified] = useState(false);

  useEffect(() => {
    const appSession = checkApplicationSession();

    if (!appSession && !disableRedirect) {
      window.location.href = '/';
    }

    setAccountVerified(appSession !== null);
  }, [setAccountVerified, disableRedirect]);

  return accountVerified;
};
