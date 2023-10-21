export class ValidationHelpers {
  static isURL(path: string) {
    const regex = new RegExp(
      '^https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.' +
        '[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.' +
        '[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.' +
        '[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,}$',
      'i',
    );

    return regex.test(path);
  }
}
