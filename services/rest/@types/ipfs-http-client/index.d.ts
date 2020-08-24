declare module 'ipfs-http-client' {
  type FileContent = any;

  interface FileObject {
    path?: string;
    content?: FileContent;
    mode?: number | string;
    mtime?: number;
  }

  interface IpfsHttpClientConfig {
    host: string;
    port: string;
  }

  function ipfsClient(input: IpfsHttpClientConfig): IpfsHttpClient;

  export interface IpfsHttpClient {
    add(
      data: FileObject | FileContent,
      options?: any
    ): Promise<AddResult>;
  }

  export interface AddResult {
    path: string;
    cid: string;
    size: number;
  }

  export default ipfsClient;
}
