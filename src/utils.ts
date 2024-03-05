export const callWithTimeout = async <T>(
  fn: () => Promise<T>,
  timeout: number,
  timeoutMessage: string
): Promise<T> => {
  return await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeout);
    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};
