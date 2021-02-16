export interface TemplateVariables {
  /**
   * E.g. if template contains {{name}}, key should be "name"
   */
  [key: string]: string;
}

const parseTemplateVars = (
  html: string,
  templateVariables: TemplateVariables
): string => {
  let result = html;

  Object.keys(templateVariables).forEach(key => {
    const currValue = templateVariables[key] || '';
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), currValue);
  });

  return result;
};

export default parseTemplateVars;
