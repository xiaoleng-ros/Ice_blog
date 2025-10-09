import HCaptcha from '@hcaptcha/react-hcaptcha';
import { forwardRef, Ref } from 'react';
import { useConfigStore } from '@/stores';

export default forwardRef(({ setToken }: { setToken: (token: string) => void }, ref: Ref<HCaptcha>) => {
  const config = useConfigStore();
  const sitekey = config?.other?.hcaptcha_key;

  return (
    <div>
      <HCaptcha theme={config.isDark ? 'dark' : 'light'} sitekey={sitekey} onVerify={setToken} ref={ref} />
    </div>
  );
});
