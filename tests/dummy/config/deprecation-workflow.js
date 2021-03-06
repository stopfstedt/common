/* global window */

window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'computed-property.override' }, //ember-modal
    { handler: 'silence', matchId: 'computed-property.volatile' },
    { handler: 'silence', matchId: 'common.async-computed' },
    { handler: 'silence', matchId: 'ember-metal.get-with-default' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-for' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-since' },
    { handler: 'silence', matchId: 'ember-string.htmlsafe-ishtmlsafe' },
  ],
};
