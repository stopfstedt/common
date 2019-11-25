import {
  create,
  collection,
  clickable,
  fillable,
  hasClass,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-session-postrequisite-editor]',
  selectedPostrequisite: text('[data-test-selected-postrequisite]'),
  removeSelectedPostrequisite: clickable('[data-test-selected-postrequisite] [data-test-remove]'),
  filterBy: fillable('[data-test-filter]'),
  postRequisites: collection('[data-test-postrequisites] [data-test-postrequisite]', {
    isSelected: hasClass('active'),
    title: text('td', {at: 1}),
  }),
  close: clickable('[data-test-cancel]'),
  save: clickable('[data-test-save]'),
};

export default definition;
export const component = create(definition);