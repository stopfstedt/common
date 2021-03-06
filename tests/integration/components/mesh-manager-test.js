import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/mesh-manager';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | mesh-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.trees = this.server.createList('meshTree', 3);
    this.concepts = this.server.createList('meshConcept', 3);

    const concept = this.server.create('meshConcept', {
      scopeNote: '1234567890'.repeat(30),
    });
    this.concepts.push(concept);
  });

  test('searching works', async function (assert) {
    this.server.create('meshDescriptor', {
      concepts: this.concepts,
      trees: this.trees,
    });
    this.server.create('meshDescriptor', {
      deleted: true,
    });
    const descriptors = this.server.createList('meshDescriptor', 3);

    this.set('nothing', () => {});
    this.set('terms', [descriptors[0], descriptors[2]]);
    await render(hbs`<MeshManager
      @editable={{true}}
      @terms={{this.terms}}
      @add={{this.nothing}}
      @remove={{this.nothing}}
    />`);
    assert.equal(component.selectedTerms.length, 2);
    assert.equal(component.selectedTerms[0].title, 'descriptor 2');
    assert.equal(component.selectedTerms[1].title, 'descriptor 4');
    await component.search('descriptor');
    await component.runSearch();

    assert.equal(component.searchResults.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.equal(component.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(component.searchResults[0].isEnabled);
    assert.ok(component.searchResults[1].isEnabled);
    assert.ok(component.searchResults[2].isDisabled);
    assert.ok(component.searchResults[3].isEnabled);
    assert.ok(component.searchResults[4].isDisabled);

    assert.notOk(component.showMoreIsVisible);
  });

  test('searching with more than 50 results', async function (assert) {
    this.server.createList('meshDescriptor', 200);
    this.set('nothing', () => {});
    await render(hbs`<MeshManager
      @editable={{true}}
      @terms={{array}}
      @add={{this.nothing}}
      @remove={{this.nothing}}
    />`);
    await component.search('descriptor');
    await component.runSearch();

    assert.equal(component.searchResults.length, 50);
    for (let i = 0; i < 50; i++) {
      assert.equal(component.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(component.showMoreIsVisible);
    await component.showMore();
    assert.equal(component.searchResults.length, 100);
    for (let i = 0; i < 100; i++) {
      assert.equal(component.searchResults[i].title, `descriptor ${i}`);
    }
  });

  test('clicking on unselected term adds it.', async function (assert) {
    assert.expect(3);
    const descriptors = this.server.createList('meshDescriptor', 3);
    this.set('nothing', () => {});
    this.set('add', (term) => {
      assert.equal(term.name, 'descriptor 1');
    });
    this.set('terms', [descriptors[0], descriptors[2]]);
    await render(hbs`<MeshManager
      @editable={{true}}
      @terms={{this.terms}}
      @add={{this.add}}
      @remove={{this.nothing}}
    />`);
    await component.search('descriptor');
    await component.runSearch();
    assert.ok(component.searchResults[1].isEnabled);
    assert.equal(component.searchResults[1].title, 'descriptor 1');
    await component.searchResults[1].add();
  });

  test('clicking on selected term does not add it.', async function (assert) {
    assert.expect(1);
    const descriptors = this.server.createList('meshDescriptor', 3);
    this.set('nothing', () => {});
    this.set('add', () => {
      // this function should never be invoked.
      assert.ok(false);
    });
    this.set('terms', descriptors);
    await render(hbs`<MeshManager
      @editable={{true}}
      @terms={{this.terms}}
      @add={{this.add}}
      @remove={{this.nothing}}
    />`);
    await component.search('descriptor');
    await component.runSearch();
    assert.ok(component.searchResults[0].isDisabled);
    await component.searchResults[0].add();
  });
});
