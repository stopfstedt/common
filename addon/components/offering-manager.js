import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

export default class OfferingManagerComponent extends Component {
  @tracked isEditing = false;
  @tracked showRemoveConfirmation = false;
  @tracked hoveredGroups = [];

  @action
  save(startDate, endDate, room, url, learnerGroups, learners, instructorGroups, instructors) {
    this.args.offering.setProperties({
      startDate,
      endDate,
      room,
      url,
      learnerGroups,
      learners,
      instructorGroups,
      instructors,
    });

    return this.args.offering.save();
  }

  @action
  toggleHover(id) {
    if (this.hoveredGroups.includes(id)) {
      this.hoveredGroups = this.hoveredGroups.filter((theId) => theId !== id);
    } else {
      this.hoveredGroups = [...this.hoveredGroups, id];
    }
  }

  @task
  *textCopied() {
    yield timeout(3000);
  }
  @action
  setLearnerGroupElement(element, [id]) {
    set(this, `learnerGroupElement${id}`, element);
  }
}
