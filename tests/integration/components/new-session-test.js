import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/new-session';

module('Integration | Component | new session', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const sessionType = this.server.create('sessionType');
    const sessionType2 = this.server.create('sessionType');
    this.sessionType = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType.id);
    this.sessionType2 = await this.owner
      .lookup('service:store')
      .find('session-type', sessionType2.id);
  });

  test('it renders', async function (assert) {
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    await render(
      hbs`<NewSession @save={{noop}} @cancel={{noop}} @sessionTypes={{this.sessionTypes}} />`
    );
    assert.equal(component.sessionTypes.length, 2);
    assert.equal(component.sessionTypes[0].title, 'session type 0');
    assert.equal(component.sessionTypes[1].title, 'session type 1');
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      hbs`<NewSession @save={{noop}} @cancel={{this.cancel}} @sessionTypes={{array}} />`
    );
    await component.cancel();
  });

  test('save', async function (assert) {
    assert.expect(2);
    const newTitle = 'foobar';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', (session) => {
      assert.equal(session.get('title'), newTitle);
      assert.equal(session.get('sessionType').get('title'), this.sessionType2.title);
    });
    await render(
      hbs`<NewSession @save={{this.save}} @cancel={{noop}} @sessionTypes={{this.sessionTypes}} />`
    );
    await component.selectSessionType(2);
    await component.title.set(newTitle);
    await component.save();
  });

  test('save on pressing enter in title field', async function (assert) {
    assert.expect(2);
    const newTitle = 'foobar';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', (session) => {
      assert.equal(session.get('title'), newTitle);
      assert.equal(session.get('sessionType').get('title'), this.sessionType2.title);
    });
    await render(
      hbs`<NewSession @save={{this.save}} @cancel={{noop}} @sessionTypes={{this.sessionTypes}} />`
    );
    await component.selectSessionType(2);
    await component.title.set(newTitle);
    await component.title.submit();
  });

  test('input validation fails if title is too short', async function (assert) {
    const newTitle = 'fo';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', () => {
      assert.ok(false);
    });
    await render(
      hbs`<NewSession @save={{this.save}} @cancel={{noop}} @sessionTypes={{this.sessionTypes}} />`
    );
    assert.notOk(component.hasError);
    await component.title.set(newTitle);
    await component.title.submit();
    assert.ok(component.hasError);
  });

  test('input validation fails if title is too long', async function (assert) {
    const newTitle = '0123456789'.repeat(21);
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', () => {
      assert.ok(false);
    });
    await render(
      hbs`<NewSession @save={{this.save}} @cancel={{noop}} @sessionTypes={{this.sessionTypes}} />`
    );
    assert.notOk(component.hasError);
    await component.title.set(newTitle);
    await component.title.submit();
    assert.ok(component.hasError);
  });
});
