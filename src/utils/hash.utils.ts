import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
export class HashHelpers {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static encryptAES(content: string) {
    return CryptoJS.AES.encrypt(
      JSON.stringify({ content }),
      process.env.AES_SECRET,
    ).toString();
  }

  static decryptAES(crypted: string) {
    return JSON.parse(
      CryptoJS.AES.decrypt(crypted, process.env.AES_SECRET).toString(
        CryptoJS.enc.Utf8,
      ),
    ).content;
  }
}
