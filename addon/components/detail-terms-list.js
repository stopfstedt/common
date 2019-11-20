import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { all }  from 'rsvp';

/**
 * Displays all given terms that belong to a given vocabulary as a list of tags.
 */
export default Component.extend({
  classNames: ['detail-terms-list'],

  /**
   * Flag indicating whether terms can be removed from the list or not.
   *
   * @property canEdit
   * @type {boolean}
   * @public
   */
  canEdit: false,

  /**
   * A vocabulary model.
   *
   * @property vocabulary
   * @type {DS.Model}
   */
  vocabulary: null,

  /**
   * A list of term models.
   *
   * @property terms
   * @type {Array}
   * @public
   */
  terms: null,

  /**
   * A sorted list of the filtered terms.
   * Terms are sorted by title including parent titles.
   *
   * @property sortedTerms
   * @type {Ember.computed}
   * @public
   */
  sortedTerms: computed('filteredTerms.[]', async function() {
    const terms = this.filteredTerms;
    const proxies = await all(terms.map(async (term) => {
      const title = await term.titleWithParentTitles;
      return { term, title };
    }));
    const sortedProxies = proxies.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return (titleA > titleB ? 1 : (titleA < titleB ? -1 : 0));
    });
    return sortedProxies.mapBy('term');
  }),

  /**
   * A filtered list of the given terms.
   * Terms are filtered by the given vocabulary.
   *
   * @property filteredTerms
   * @type {Ember.computed}
   * @protected
   */
  filteredTerms: computed('terms.[]', 'vocabulary', function () {
    let terms = this.get('terms');
    if (isEmpty(terms)) {
      return [];
    }
    let vocab = this.get('vocabulary');
    let filteredTerms = [];
    terms.forEach((term) => {
      if (term.get('vocabulary.id') === vocab.get('id')) {
        filteredTerms.push(term);
      }
    });
    return filteredTerms;
  }),

  actions: {
    remove(term) {
      if (this.get('canEdit')) {
        this.remove(term);
      }
    }
  }
});
