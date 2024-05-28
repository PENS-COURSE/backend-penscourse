import { Str } from '@jimuelpalaca/str';
import Slugify from 'slugify';
export class StringHelper {
  static slug(str: string, withRandom = true) {
    return Slugify(`${str} ${withRandom ? Str.random(6) : ''}`, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  static random(length = 6) {
    return Str.random(length);
  }

  static getInitials(str: string) {
    return str
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
  }
}
