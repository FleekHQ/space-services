import React from 'react';
import { Location } from '@reach/router';
import queryString from 'query-string';

const withLocation = (ComponentToWrap: React.Component) => props => (
  <Location>
    {({ location, navigate }) => (
      <ComponentToWrap
        {...props}
        location={location}
        navigate={navigate}
        search={location.search ? queryString.parse(location.search) : {}}
      />
    )}
  </Location>
);

export default withLocation;
