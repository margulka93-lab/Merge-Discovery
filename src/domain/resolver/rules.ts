import type { ElementDefinition, TagRuleDefinition, TagSelector } from '../model/types';

export function selectorMatches(selector: TagSelector, element: ElementDefinition): boolean {
  return (selector.all ?? []).every(t => element.tags.includes(t)) &&
    (!selector.any?.length || selector.any.some(t => element.tags.includes(t))) &&
    (selector.none ?? []).every(t => !element.tags.includes(t));
}
export function ruleMatches(rule: TagRuleDefinition, a: ElementDefinition, b: ElementDefinition): boolean {
  if (rule.exclusions?.includes(a.id) || rule.exclusions?.includes(b.id)) return false;
  const [first, second] = rule.inputSelectors;
  return (selectorMatches(first, a) && selectorMatches(second, b)) || (selectorMatches(first, b) && selectorMatches(second, a));
}
export function specificity(rule: TagRuleDefinition): number {
  return rule.inputSelectors.reduce((total, s) => total + (s.all?.length ?? 0) + (s.any?.length ?? 0) + (s.none?.length ?? 0), 0);
}
