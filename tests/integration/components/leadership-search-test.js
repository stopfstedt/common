import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | leadership search', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<LeadershipSearch
      @existingUsers={{array}}
      @selectUser={{noop}}
    />`);

    const search = 'input[type="search"]';

    assert.dom(search).exists({ count: 1 });
  });

  test('less than 3 charecters triggers warning', async function (assert) {
    await render(hbs`<LeadershipSearch
      @existingUsers={{array}}
      @selectUser={{noop}}
    />`);
    const search = 'input[type="search"]';
    const results = 'ul';

    await fillIn(search, 'ab');
    assert.dom(results).hasText('keep typing...');
  });

  test('input triggers search', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    await render(hbs`<LeadershipSearch
      @existingUsers={{array}}
      @selectUser={{noop}}
    />`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;
    const firstResult = `${results}:nth-of-type(2)`;

    await fillIn(search, 'test person');
    assert.dom(resultsCount).hasText('1 result');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ''), 'testM.persontestemail');

    // Check that special characters do not mess things up.
    await fillIn(search, 'test?person');
    assert.dom(resultsCount).hasText('1 result');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ''), 'testM.persontestemail');

    // Check that multiple special characters do not mess things up.
    await fillIn(search, 'test"person"');
    assert.dom(resultsCount).hasText('1 result');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ''), 'testM.persontestemail');
  });

  test('no results displays messages', async function (assert) {
    await render(hbs`<LeadershipSearch
      @existingUsers={{array}}
      @selectUser={{noop}}
    />`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;

    await fillIn(search, 'search words');
    assert.dom(resultsCount).hasText('no results');
  });

  test('click user fires add user', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    this.set('select', (user) => {
      assert.equal(1, user.id);
    });
    await render(hbs`<LeadershipSearch
      @existingUsers={{array}}
      @selectUser={{this.select}}
    />`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const firstResult = `${results}:nth-of-type(2)`;

    await fillIn(search, 'test');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ''), 'testM.persontestemail');
    await click(firstResult);
  });

  test('can not add users twice', async function (assert) {
    assert.expect(7);
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail',
    });
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      email: 'testemail2',
    });
    this.set('select', (user) => {
      assert.equal(user.id, 2, 'only user2 should be sent here');
    });
    const user1 = this.owner.lookup('service:store').find('user', 1);

    this.set('existingUsers', [user1]);
    await render(hbs`<LeadershipSearch
      @existingUsers={{this.existingUsers}}
      @selectUser={{this.select}}
    />`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;
    const firstResult = `${results}:nth-of-type(2)`;
    const secondResult = `${results}:nth-of-type(3)`;

    await fillIn(search, 'test');

    assert.dom(resultsCount).hasText('2 results');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ''), 'testM.persontestemail');
    assert.dom(firstResult).hasNoClass('clickable');
    assert.dom(firstResult).hasClass('inactive');
    assert.equal(
      find(secondResult).textContent.replace(/[\t\n\s]+/g, ''),
      'testM.person2testemail2'
    );
    assert.dom(secondResult).hasClass('clickable');
    await click(firstResult);
    await click(secondResult);
  });
});
