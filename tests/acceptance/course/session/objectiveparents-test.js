import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Objective Parents', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    const objectives = this.server.createList('objective', 3);
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      objectives,
    });
    const objective1 = this.server.create('objective', {
      parents: [objectives[0], objectives[1]]
    });
    const objective2 = this.server.create('objective');
    this.server.create('session', {
      course,
      objectives: [objective1, objective2],
    });
  });

  test('list parent objectives', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(14);

    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });
    assert.equal(page.objectives.objectiveList.objectives.length, 2);

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 1');

    await page.objectives.objectiveList.objectives[0].manageParents();

    const m = page.objectives.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.courseTitle, 'course 0');
    assert.equal(m.objectives.length, 3);
    assert.equal(m.objectives[0].title, 'objective 0');
    assert.ok(m.objectives[0].selected);
    assert.equal(m.objectives[1].title, 'objective 1');
    assert.ok(m.objectives[1].selected);
    assert.equal(m.objectives[2].title, 'objective 2');
    assert.ok(m.objectives[2].notSelected);
  });

  test('save changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 1');

    await page.objectives.objectiveList.objectives[0].manageParents();

    const m = page.objectives.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[2].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].selected);
    assert.ok(m.objectives[2].selected);
    await page.objectives.save();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 1');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 2');

  });

  test('cancel changes', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(13);
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 1');

    await page.objectives.objectiveList.objectives[0].manageParents();

    const m = page.objectives.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[2].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].selected);
    assert.ok(m.objectives[2].selected);
    await page.objectives.cancel();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 1');
  });

  test('deselect all parents for session objective', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: 1, sessionId: 1, sessionObjectiveDetails: true });

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 2);
    assert.equal(page.objectives.objectiveList.objectives[0].parents[0].description, 'objective 0');
    assert.equal(page.objectives.objectiveList.objectives[0].parents[1].description, 'objective 1');

    await page.objectives.objectiveList.objectives[0].manageParents();

    const m = page.objectives.manageObjectiveParents;
    assert.equal(m.objectiveTitle, 'objective 3');
    assert.equal(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[1].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].notSelected);
    assert.ok(m.objectives[2].notSelected);
    await page.objectives.save();

    assert.equal(page.objectives.objectiveList.objectives[0].description.text, 'objective 3');
    assert.equal(page.objectives.objectiveList.objectives[0].parents.length, 0);
  });
});
