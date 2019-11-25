import { resolve } from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

let mockEvents;
let userEventsMock;
let blankEventsMock;
let preWork;

module('Integration | Component | dashboard agenda', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.setupRouter();
    const today = moment();
    const tomorrow = moment().add(1, 'day').endOf('day');
    preWork = [
      {
        name: 'prework 1',
        startDate: today.format(),
        endDate: tomorrow.format(),
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'third',
      },
      {
        name: 'prework 2',
        startDate: today.format(),
        endDate: tomorrow.format(),
        location: "room 111",
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
      },
      {
        name: 'prework 2',
        startDate: today.format(),
        endDate: tomorrow.format(),
        location: "room 111",
        ilmSession: true,
        slug: 'whatever',
        postrequisiteSlug: 'something',
        postrequisiteName: 'first',
      },
    ];

    mockEvents = [
      {
        name: 'first',
        startDate: today.format(),
        location: 123,
        lastModified: today.format(),
        attendanceRequired: true,
        equipmentRequired: true,
        attireRequired: true,
        postrequisites: [],
        prerequisites: [
          preWork[1],
          preWork[2],
        ],
      },
      {
        name: 'second',
        startDate: today.format(),
        location: 456,
        lastModified: today.format(),
        attendanceRequired: false,
        equipmentRequired: false,
        attireRequired: false,
        postrequisites: [],
      },
      {
        name: 'third',
        startDate: today.format(),
        location: 789,
        lastModified: today.format(),
        attendanceRequired: false,
        equipmentRequired: false,
        attireRequired: false,
        postrequisites: [],
        prerequisites: [
          preWork[0],
        ],
      },
    ];

    preWork[0].postrequisites = [mockEvents[2]];
    preWork[1].postrequisites = [mockEvents[0]];
    preWork[2].postrequisites = [mockEvents[0]];

    userEventsMock = Service.extend({
      getEvents() {
        return new resolve(mockEvents);
      },
    });
    blankEventsMock = Service.extend({
      getEvents() {
        return new resolve([]);
      },
    });

  });

  test('it renders with events', async function (assert) {
    assert.expect(11);
    this.owner.register('service:user-events', userEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`{{dashboard-agenda}}`);
    const title = 'h3';

    return settled().then(() => {
      assert.dom(this.element.querySelector(title)).hasText('My Activities for the next 60 days');
      assert.equal(this.element.querySelectorAll('table tr').length, 3);
      for (let i = 0; i < 3; i++) {
        const tds = this.element.querySelectorAll(`table tr:nth-of-type(${i + 1}) td`);
        assert.dom(tds[0]).hasText(moment(mockEvents[i].startDate).format('dddd, MMMM Do, YYYY h:mma'));
        assert.dom(tds[1]).hasText(mockEvents[i].name);
      }
      const preworkSelector = '[data-test-ilios-calendar-pre-work-event]';
      assert.equal(this.element.querySelectorAll(preworkSelector).length, 2);
      assert.dom(this.element.querySelector(`${preworkSelector}:nth-of-type(1)`))
        .hasText(
          'prework 2 Due Before first (' + moment(mockEvents[0].startDate).format('M/D/YYYY') + ')'
        );
      assert.dom(this.element.querySelector(`${preworkSelector}:nth-of-type(2)`))
        .hasText(
          'prework 1 Due Before third (' + moment(mockEvents[2].startDate).format('M/D/YYYY') + ')'
        );
    });
  });

  test('session attribute icons', async function (assert) {
    assert.expect(6);
    this.owner.register('service:user-events', userEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`{{dashboard-agenda}}`);
    return settled().then(() => {
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(1) td:nth-of-type(4) .fa-black-tie').length, 1);
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(1) td:nth-of-type(4) .fa-flask').length, 1);
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(1) td:nth-of-type(4) .fa-calendar-check').length, 1);
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(2) td:nth-of-type(4) .fa-black-tie').length, 0);
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(2) td:nth-of-type(4) .fa-flask').length, 0);
      assert.equal(this.element.querySelectorAll('table tr:nth-of-type(2) td:nth-of-type(4) .fa-calendar-check').length, 0);
    });
  });

  test('it renders blank', async function (assert) {
    assert.expect(2);
    this.owner.register('service:user-events', blankEventsMock);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`{{dashboard-agenda}}`);
    const title = 'h3';
    const body = 'p';

    return settled().then(() => {
      assert.dom(this.element.querySelector(title)).hasText('My Activities for the next 60 days');
      assert.dom(this.element.querySelector(body)).hasText('None');
    });
  });
});
