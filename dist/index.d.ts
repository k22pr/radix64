/// <reference types="node" />
declare const _default: (alphabet?: string) => {
    encodeBuffer: (buffer: Buffer, length?: number) => string;
    encodeInt: (num: number, length?: number) => string;
    decodeToBuffer: (string: string, bytes?: any) => Buffer;
    decodeToInt: (string: string) => number;
};
export default _default;
