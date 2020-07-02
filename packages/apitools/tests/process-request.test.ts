import { processRequest } from '../src';

describe('processRequest', () => {
  it('returns successfully if process does not fail', () => {
    const result = processRequest(() => {
      return {
        key: 'value',
      };
    });

    expect(result).toMatchSnapshot();
  });

  it('returns error message if the process fails', () => {
    const result = processRequest(() => {
      throw new Error('Some error');
    });

    expect(result).toMatchSnapshot();
  });

  it('works for async processes', () => {
    const result = processRequest(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ result: 'Async invocation' });
        }, 10);
      });
    });

    expect(result).toMatchSnapshot();
  });
});
