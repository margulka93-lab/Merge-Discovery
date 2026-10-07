import type { LabReaction } from './laboratory';
export type AudioEvent = 'ui_select' | 'combine_known' | 'combine_no_reaction' | 'discover_alternate' | 'discover_new' | 'collection_complete' | 'set_reveal' | 'hidden_set_reveal' | 'anomaly_unstable';
/** Presentation hierarchy only; the committed resolution and disclosure remain authoritative. */
export function reactionPresentation(reaction?: LabReaction): { tier: number; audio?: AudioEvent; acknowledgement: boolean } {
  if (!reaction) return { tier: 0, acknowledgement: false };
  const emphasis = reaction.emphasis;
  if (emphasis === 'anomaly') return { tier: 3, audio: 'anomaly_unstable', acknowledgement: true };
  if (emphasis === 'hidden-set' || emphasis === 'secret-set') return { tier: 5, audio: 'hidden_set_reveal', acknowledgement: true };
  if (emphasis === 'collection') return reaction.collectionCallouts?.some(c => c.kind === 'completed')
    ? { tier: 4, audio: 'collection_complete', acknowledgement: true }
    : { tier: 3, audio: 'discover_new', acknowledgement: true };
  if (emphasis === 'set') return { tier: 4, audio: 'set_reveal', acknowledgement: true };
  if (reaction.kind === 'new') return { tier: 3, audio: 'discover_new', acknowledgement: true };
  if (reaction.kind === 'alternate') return { tier: 2, audio: 'discover_alternate', acknowledgement: false };
  return { tier: 1, audio: reaction.kind === 'known' ? 'combine_known' : 'combine_no_reaction', acknowledgement: false };
}
