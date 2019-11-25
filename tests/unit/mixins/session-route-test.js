import EmberObject from '@ember/object';
import SessionRouteMixin from 'ilios-common/mixins/session-route';
import { module, test } from 'qunit';

module('Unit | Mixin | session-route', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    const SessionRouteObject = EmberObject.extend(SessionRouteMixin);
    const subject = SessionRouteObject.create();
    assert.ok(subject);
  });
});
