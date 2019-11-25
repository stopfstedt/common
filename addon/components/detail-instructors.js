import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { all } from 'rsvp';

export default Component.extend({
  currentUser: service(),
  tagName: 'section',
  classNames: ['detail-instructors'],
  ilmSession: null,
  isManaging: false,
  instructorGroupBuffer: null,
  instructorBuffer: null,
  'data-test-detail-instructors': true,

  availableInstructorGroups: computed('currentUser.model', async function() {
    const model = await this.currentUser.model;
    const school = await model.get('school');
    return await school.instructorGroups;
  }),

  init() {
    this._super(...arguments);
    this.set('instructorGroupBuffer', []);
    this.set('instructorBuffer', []);
  },
  actions: {
    manage() {
      const promises = [];
      promises.pushObject(this.get('ilmSession.instructorGroups').then(instructorGroups => {
        this.set('instructorGroupBuffer', instructorGroups.toArray());
      }));

      promises.pushObject(this.get('ilmSession.instructors').then(instructors => {
        this.set('instructorBuffer', instructors.toArray());
      }));

      all(promises).then(()=>{
        this.set('isManaging', true);
      });
    },
    save() {
      var ilmSession = this.get('ilmSession');

      const instructorGroups = ilmSession.get('instructorGroups');
      const removableInstructorGroups = instructorGroups.filter(group => !this.get('instructorGroupBuffer').includes(group));
      instructorGroups.clear();
      removableInstructorGroups.forEach(group => {
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.get('instructorGroupBuffer').forEach(function(group){
        instructorGroups.pushObject(group);
        group.get('ilmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);

        });
      });

      const instructors = ilmSession.get('instructors');
      const removableInstructors = instructors.filter(user => !this.get('instructorBuffer').includes(user));
      instructors.clear();
      removableInstructors.forEach(user => {
        user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.removeObject(ilmSession);
        });
      });
      this.get('instructorBuffer').forEach(function(user){
        instructors.pushObject(user);
        user.get('instructorIlmSessions').then(ilmSessions => {
          ilmSessions.pushObject(ilmSession);

        });
      });

      ilmSession.save().then(() => {
        this.set('isManaging', false);
      });

    },
    cancel(){
      this.set('instructorGroupBuffer', []);
      this.set('instructorBuffer', []);
      this.set('isManaging', false);
    },
    addInstructorGroupToBuffer(instructorGroup){
      this.get('instructorGroupBuffer').pushObject(instructorGroup);
    },
    addInstructorToBuffer(instructor){
      this.get('instructorBuffer').pushObject(instructor);
    },
    removeInstructorGroupFromBuffer(instructorGroup){
      this.get('instructorGroupBuffer').removeObject(instructorGroup);
    },
    removeInstructorFromBuffer(instructor){
      this.get('instructorBuffer').removeObject(instructor);
    },
  }
});
