import axios from 'axios';

interface Thread {
  displayStatus: number;
  id: string;
  content: string;
  contentUrl: string;
  threadType: string;
  userId: string;
  userName: string;
  userHandle: string;
  userPicture: string;
  createdDate: string;
  answerCount: number;
  likeCount: number;
  bookmarkCount: number;
  repostCount: number;
  repostId: null | string;
  answerId: string;
  isDeleted: boolean;
  privacyType: number;
  answerPrivacyType: number;
  language: string;
  isPinned: boolean;
  pinnedInCommunity: boolean;
  paywall: boolean;
  price: string;
  tipAmount: number;
  tipCount: number;
  currency: string;
  currencyAddress: null | string;
  currencyDecimals: number;
  communityId: null | string;
  user: any; // Está como [Object] en la respuesta
  like: null | any;
  bookmark: null | any;
  reposted: null | any;
  images: any[];
  videos: any[];
  stage: null | any;
  livestream: null | any;
}

interface ThreadResponse {
  threads: Thread[];
  count: number;
  page: string;
  pageSize: string;
}

async function getThreadAnswers(threadId: string): Promise<
  | {
      userName: string;
      userHandle: string;
      content: string;
      address: string;
    }[]
  | null
> {
  try {
    const response = await axios<ThreadResponse>({
      method: 'get',
      url: 'https://api.starsarena.com/threads/answers',
      params: {
        threadId,
        page: 1,
        pageSize: 12,
      },
      headers: {
        accept: 'application/json, text/plain, */*',
        authorization:
          'Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiODg1MjM0MDMtOGEwZS00MzNhLTg2YjktNTk3ODAzNjAwMDFjIiwidHdpdHRlcklkIjoiODA3MDQwODU4MTEzNjM0MzA1IiwidHdpdHRlckhhbmRsZSI6ImJ5cGFyY2Vyb18iLCJ0d2l0dGVyTmFtZSI6IkFuZHIxMXMiLCJ0d2l0dGVyUGljdHVyZSI6Imh0dHBzOi8vc3RhdGljLnN0YXJzYXJlbmEuY29tL3VwbG9hZHMvOWJhNDAyZmItMGRkOS03MTNjLTQ5NTUtNTY3Y2IyNmMwNzFkMTczMjI4MTM3NzU5NS5wbmciLCJhZGRyZXNzIjoiMHgyNDEwYWMwYjQ0ZTE3MDc3N2UyODY1Y2ZiNWEwMDIwMDdjY2YxNWVhIn0sImlhdCI6MTc0OTQ5MzY2OCwiZXhwIjoxNzU4MTMzNjY4fQ.gCh4CMmLYxMP08cgfMo7Hs3FGOZHY8e2jvusdmftT-I0u7m7O_8hARpTkbwikxzRHhDNP9wPb0qvEUPK34FoEzh-MyEn1hEu4Xo1GnvLPXb3JEBJ2SR9lXdYivp9B7_JQ3n1s8h0ZL3KGmawpanGxMzSYlXUZd2zvQytKqmfmBLX5k5sideGciFpuaxuyiN_FJH37yAziJ-3CfZd5O5WaQj5X7sTvlfgUSyjky2lk4YWYZSx_b_xlStPGQ2vSJW7ff5cVDxHOMe3riwz3QTLL_10vq-UuBNaBwpSCTPDA1vyeKK2h1Ffn4MaX6c4x_1tBfqiKrdt81M5zm-gpLN7gpRSdU-0wxjwzqGOREP2t4aQi7bTpmMwR9gf3gCYWD0RmSalpddCHxEFVjU9jmlCrbXoAdkjucaqc6g8pNYQuzZSH8RSo2woh7cQfq1hLj1ojYs1_lhJomFgQr1z-MKV1pxPYiEQRFs2DuF1byzX_JHGJK9O-8_Hi8FgWfZPOpgQSW0pjt-2hWmhVy-xKCPJLTuolQRxvnXJT-cdFlTqnxAl1R8G75FnViPNzOhnKoKS2vqNxYEdimvl217gTj0eDddAlpRUCu3FRRrb3WDGnbBTugWPQBlerifZ9rJqJiDc5VfrtojuuPqpQRVPv2tSDcHYGVPYsaflcZ6tOnc19Ho',
        origin: 'https://arena.social',
        referer: 'https://arena.social/',
      },
    });

    return response.data.threads.map((thread) => ({
      userName: thread.userName,
      userHandle: thread.userHandle,
      content: thread.content,
      address: thread.user.address,
    }));
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

export default getThreadAnswers;
