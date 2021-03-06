import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { validatable, Length, HtmlNotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SessionObjectiveListItemComponent extends Component {
  @service store;

  @Length(3, 65000) @HtmlNotBlank() @tracked title;
  @tracked isManagingParents;
  @tracked parentsBuffer = [];
  @tracked isManagingDescriptors;
  @tracked descriptorsBuffer = [];
  @tracked isManagingTerms;
  @tracked termsBuffer = [];
  @tracked selectedVocabulary;

  @action
  load(element, [sessionObjective]) {
    if (!sessionObjective) {
      return;
    }
    this.title = this.args.sessionObjective.title;
  }

  get isManaging() {
    return this.isManagingParents || this.isManagingDescriptors || this.isManagingTerms;
  }

  @dropTask
  *saveTitleChanges() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.sessionObjective.set('title', this.title);
    yield this.args.sessionObjective.save();
  }

  @dropTask
  *manageParents() {
    const parents = yield this.args.sessionObjective.courseObjectives;
    this.parentsBuffer = parents.toArray();
    this.isManagingParents = true;
  }
  @dropTask
  *manageDescriptors() {
    const meshDescriptors = yield this.args.sessionObjective.meshDescriptors;
    this.descriptorsBuffer = meshDescriptors.toArray();
    this.isManagingDescriptors = true;
  }
  @dropTask
  *manageTerms(vocabulary) {
    this.selectedVocabulary = vocabulary;
    const terms = yield this.args.sessionObjective.terms;
    this.termsBuffer = terms.toArray();
    this.isManagingTerms = true;
  }

  @restartableTask
  *highlightSave() {
    yield timeout(1000);
  }

  @dropTask
  *saveParents() {
    const newParents = this.parentsBuffer.map((obj) => {
      return this.store.peekRecord('course-objective', obj.id);
    });
    this.args.sessionObjective.set('courseObjectives', newParents);
    yield this.args.sessionObjective.save();
    this.parentsBuffer = [];
    this.isManagingParents = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveDescriptors() {
    this.args.sessionObjective.set('meshDescriptors', this.descriptorsBuffer);
    yield this.args.sessionObjective.save();
    this.descriptorsBuffer = [];
    this.isManagingDescriptors = false;
    this.highlightSave.perform();
  }

  @dropTask
  *saveTerms() {
    this.args.sessionObjective.set('terms', this.termsBuffer);
    yield this.args.sessionObjective.save();
    this.termsBuffer = [];
    this.isManagingTerms = false;
    this.highlightSave.perform();
  }

  @action
  revertTitleChanges() {
    this.title = this.args.sessionObjective.title;
    this.removeErrorDisplayFor('title');
  }
  @action
  changeTitle(contents) {
    this.title = contents;
    this.addErrorDisplayFor('title');
  }
  @action
  addParentToBuffer(objective) {
    this.parentsBuffer = [...this.parentsBuffer, objective];
  }
  @action
  removeParentFromBuffer(objective) {
    this.parentsBuffer = this.parentsBuffer.filter((obj) => obj.id !== objective.id);
  }
  @action
  addDescriptorToBuffer(descriptor) {
    this.descriptorsBuffer = [...this.descriptorsBuffer, descriptor];
  }
  @action
  removeDescriptorFromBuffer(descriptor) {
    this.descriptorsBuffer = this.descriptorsBuffer.filter((obj) => obj.id !== descriptor.id);
  }
  @action
  addTermToBuffer(term) {
    this.termsBuffer = [...this.termsBuffer, term];
  }
  @action
  removeTermFromBuffer(term) {
    this.termsBuffer = this.termsBuffer.filter((obj) => obj.id !== term.id);
  }
  @action
  cancel() {
    this.parentsBuffer = [];
    this.descriptorsBuffer = [];
    this.termsBuffer = [];
    this.isManagingParents = false;
    this.isManagingDescriptors = false;
    this.isManagingTerms = false;
    this.selectedVocabulary = null;
  }

  @dropTask
  *deleteObjective() {
    yield this.args.sessionObjective.destroyRecord();
  }
}
