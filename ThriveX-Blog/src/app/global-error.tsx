'use client';

import { MdOutlineError } from 'react-icons/md';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

function GlobalErrorPage({ error, reset }: Props) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-white dark:bg-black-a flex items-center justify-center">
          <div className="mx-auto flex flex-col items-center">
            <MdOutlineError className="text-[15vw] text-[#ff6262]" />
            <h1 className="text-[2vw] text-[#888] dark:text-white font-medium mt-8 text-xl">{error.message}</h1>
            <button onClick={() => reset()} className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

export default GlobalErrorPage;
