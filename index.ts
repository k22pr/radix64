const BASE = 64;
const BASE_BITS = 6;

// Use URL safe characters in lexicographically sorted order
const LEXICOGRAPHICAL_BASE64_URL =
  "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".split("").sort().join("");

export default (alphabet: string = LEXICOGRAPHICAL_BASE64_URL) => {
  alphabet = alphabet || LEXICOGRAPHICAL_BASE64_URL;
  if (alphabet.length !== BASE) {
    throw new Error("alphabet must be " + BASE + " characters long!");
  }

  let charToDec = {};
  for (let i = 0; i < alphabet.length; i++) {
    let char = alphabet[i];
    if (char in charToDec) {
      throw new Error("alphabet has duplicate characters!");
    }
    charToDec[char] = i;
  }

  function encodeBuffer(buffer: Buffer, length?: number): string {
    length = length || Math.ceil((buffer.length * 8) / 6);
    let chars = new Array(length);

    let i = 1; // start at 1 to avoid subtracting by 1
    let bufferIndex = buffer.length - 1;
    let hang = 0;
    do {
      let bufferByte;
      switch (i % 4) {
        case 1:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[bufferByte & 0x3f];
          hang = bufferByte >> 6;
          break;
        case 2:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[((bufferByte & 0x0f) << 2) | hang];
          hang = bufferByte >> 4;
          break;
        case 3:
          bufferByte = buffer[bufferIndex--];
          chars[chars.length - i] = alphabet[((bufferByte & 0x03) << 4) | hang];
          hang = bufferByte >> 2;
          break;
        case 0:
          chars[chars.length - i] = alphabet[hang];
          break;
      }
      i++;
    } while (bufferIndex >= 0 && i <= chars.length);

    if (i % 4 !== 1) {
      chars[chars.length - i] = alphabet[hang];
      i++;
    }
    while (i <= chars.length) {
      chars[chars.length - i] = alphabet[0];
      i++;
    }

    return chars.join("");
  }

  function encodeInt(num: number, length?: number): string {
    if (length) {
      let bounds = Math.pow(2, 6 * length);
      if (num >= bounds) {
        throw new Error(
          "Int (" +
            num +
            ") is greater than or equal to max bound (" +
            bounds +
            ") for encoded string length (" +
            length +
            ")"
        );
      }
    } else {
      let log = Math.log2(num);
      if (Math.pow(2, Math.round(log)) === num) {
        log++;
      }
      length = Math.max(1, Math.ceil(log / BASE_BITS));
    }

    let chars = new Array(length);
    let i = chars.length - 1;
    while (num > 0) {
      chars[i--] = alphabet[num % BASE];
      num = Math.floor(num / BASE);
    }
    while (i >= 0) {
      chars[i--] = alphabet[0];
    }
    return chars.join("");
  }

  function decodeToBuffer(string: string, bytes?) {
    let i = 1; // start at 1 to avoid subtracting by 1
    let buffer = new Buffer(bytes || Math.ceil((string.length * BASE_BITS) / 8));
    let bufferIndex = buffer.length - 1;
    do {
      let dec = charToDec[string[string.length - i]];
      switch (i % 4) {
        case 1:
          buffer[bufferIndex] = dec;
          break;
        case 2:
          buffer[bufferIndex--] |= (dec & 0x3) << 6;
          buffer[bufferIndex] = dec >> 2;
          break;
        case 3:
          buffer[bufferIndex--] |= (dec & 0xf) << 4;
          buffer[bufferIndex] = dec >> 4;
          break;
        case 0:
          buffer[bufferIndex--] |= dec << 2;
          break;
      }
      i++;
    } while (bufferIndex >= 0 && i <= string.length);

    if (i % 4 === 1) {
      bufferIndex++;
    }
    if (bufferIndex > 0) {
      buffer.fill(0, 0, bufferIndex);
    }

    return buffer;
  }

  function decodeToInt(string: string) {
    let i = 0;
    let num = 0;
    do {
      num = num * BASE + charToDec[string[i]];
      i++;
    } while (i < string.length);

    return num;
  }

  return {
    encodeBuffer: encodeBuffer,
    encodeInt: encodeInt,
    decodeToBuffer: decodeToBuffer,
    decodeToInt: decodeToInt,
  };
};
