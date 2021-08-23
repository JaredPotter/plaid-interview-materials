import * as request from 'request';

// The return type of framework request functions. The body is parameterized
// over type T, which can be either string, Buffer, or an object type.
export type HttpResponse<T> = {
  statusCode: number;
  statusMessage: string;
  headers: {[name: string]: string};
  body: T;
};

export type CookieJar = request.CookieJar;

export const createJar = (): CookieJar => request.jar();

export const asyncRequest = async <T>(
  uri: string,
  opts: {
    method: 'GET' | 'POST',
    form?: {},
    jar?: CookieJar,
    proxy?: string,
    strictSSL?: boolean,
  },
) => new Promise<HttpResponse<T>>((resolve, reject) => {
  request(uri, opts, (error: any, res: any) => {
    if (error != null) {
      reject(error);
    }
    resolve(res);
  });
});
