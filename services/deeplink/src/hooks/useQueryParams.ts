import { useLocation } from '@reach/router';
import queryString, { ParsedQuery } from 'query-string';

export const useQueryParams = (): ParsedQuery => {
  const location = useLocation();
  if (location.search) {
    return queryString.parse(location.search);
  }

  return {};
};

export default useQueryParams;
