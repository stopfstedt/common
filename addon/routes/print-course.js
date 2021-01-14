import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class PrintCourseRoute extends Route.extend(
  AuthenticatedRouteMixin
) {
  @service currentUser;
  @service dataLoader;

  titleToken = 'general.coursesAndSessions';
  canViewUnpublished = false;

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  // only allow privileged users to view unpublished courses
  async afterModel(course, transition) {
    this.canViewUnpublished = this.currentUser.performsNonLearnerFunction;
    if (this.canViewUnpublished || course.isPublishedOrScheduled) {
      return await Promise.all([
        this.dataLoader.loadCourse(course.id),
        this.dataLoader.loadCourseSessions(course.id),
      ]);
    }

    transition.abort();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canViewUnpublished', this.canViewUnpublished);
  }
}
