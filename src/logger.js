export const logErrorMessage = (errorCode, error) => {
  console.error(`This error arises from Page Watch browser extension. I really appreciate if you can log an issue with a screenshot of the error in https://github.com/dinesh-se/page-watch/issues. Thanks.
  Error code: ${errorCode}`, error);
};
