import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/session/objective-list-item';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | session/objective-list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders and is accessible', async function (assert) {
    assert.expect(6);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    assert.notOk(component.hasRemoveConfirmation);
    assert.equal(component.description.text, 'session objective 0');
    assert.equal(component.parents.text, 'Add New');
    assert.equal(component.meshDescriptors.text, 'Add New');
    assert.ok(component.hasTrashCan);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('can change title', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    const newDescription = 'Pluto Visits Earth';
    assert.equal(component.description.text, 'session objective 0');
    await component.description.openEditor();
    await component.description.edit(newDescription);
    await component.description.save();
    assert.equal(component.description.text, newDescription);
  });

  test('can manage parents', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    this.set('manageParents', () => {
      assert.ok(true);
    });
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    await component.parents.list[0].manage();
    assert.ok(component.parentManager.isPresent);
  });

  test('can manage descriptors', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    await component.meshDescriptors.list[0].manage();
    assert.ok(component.meshManager.isPresent);
  });

  test('can manage terms', async function (assert) {
    assert.expect(2);
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    assert.notOk(component.taxonomyManager.isPresent);
    await component.selectedTerms.manage();
    assert.ok(component.taxonomyManager.isPresent);
  });

  test('can trigger removal', async function (assert) {
    const session = this.server.create('session');
    const sessionObjective = this.server.create('sessionObjective', {
      session,
    });
    const sessionObjectiveModel = await this.owner
      .lookup('service:store')
      .find('session-objective', sessionObjective.id);
    this.set('sessionObjective', sessionObjectiveModel);
    await render(
      hbs`<Session::ObjectiveListItem
        @sessionObjective={{this.sessionObjective}}
        @editable={{true}}
        @courseObjectives={{array}}
      />`
    );
    await component.remove();
    assert.ok(component.hasRemoveConfirmation);
  });
});
