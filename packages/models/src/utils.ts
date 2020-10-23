type ValuesInput = Record<string, any>;

// eslint-disable-next-line
export function getUpdateExpressions(values: ValuesInput, allowedKeys: string[] = []) {
  const ExpressionAttributeValues = {};
  const ExpressionAttributeNames = {};

  const updates = [];

  Object.keys(values).forEach(key => {
    if (!allowedKeys.length || allowedKeys.includes(key)) {
      ExpressionAttributeValues[`:${key}`] = values[key];
      ExpressionAttributeNames[`#${key}`] = key;
      updates.push(`#${key} = :${key}`);
    }
  });

  if (!updates.length) {
    throw new Error('Invalid payload.');
  }

  const UpdateExpression = `SET ${updates.join(',')}`;

  return {
    ExpressionAttributeValues,
    ExpressionAttributeNames,
    UpdateExpression,
  };
}
