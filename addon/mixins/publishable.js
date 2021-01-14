import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
const { not, or } = computed;

export default Mixin.create({
  publishTarget: null,
  currentUser: service(),
  flashMessages: service(),
  store: service(),
  intl: service(),
  showCheckLink: true,
  menuTitle: computed(
    'intl.locale',
    'publishTarget.isPublished',
    'publishTarget.publishedAsTbd',
    function () {
      const publishTarget = this.publishTarget;
      const intl = this.intl;
      if (publishTarget.get('publishedAsTbd')) {
        return intl.t('general.scheduled');
      }
      if (publishTarget.get('isPublished')) {
        return intl.t('general.published');
      }
      return intl.t('general.notPublished');
    }
  ),
  menuIcon: computed(
    'publishTarget.isPublished',
    'publishTarget.publishedAsTbd',
    function () {
      if (this.get('publishTarget.publishedAsTbd')) {
        return 'clock';
      }
      if (this.get('publishTarget.isPublished')) {
        return 'star';
      }
      return 'cloud';
    }
  ),
  showTbd: not('publishTarget.isScheduled'),
  showAsIs: computed(
    'publishTarget.isPublished',
    'publishTarget.isScheduled',
    'publishTarget.requiredPublicationIssues.length',
    'publishTarget.allPublicationIssuesLength',
    function () {
      return (
        (!this.get('publishTarget.isPublished') ||
          this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.requiredPublicationIssues.length') === 0 &&
        this.get('publishTarget.allPublicationIssuesLength') !== 0
      );
    }
  ),
  showReview: computed(
    'publishTarget.allPublicationIssuesLength',
    'showCheckLink',
    function () {
      return (
        this.get('publishTarget.allPublicationIssuesLength') > 0 &&
        this.showCheckLink
      );
    }
  ),
  showPublish: computed(
    'publishTarget.{allPublicationIssuesLength,isPublished,isScheduled}',
    function () {
      return (
        (!this.get('publishTarget.isPublished') ||
          this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.allPublicationIssuesLength') === 0
      );
    }
  ),
  showUnPublish: or('publishTarget.isPublished', 'publishTarget.isScheduled'),
  publicationStatus: computed(
    'publishTarget.isPublished',
    'publishTarget.isScheduled',
    function () {
      if (this.get('publishTarget.isScheduled')) {
        return 'scheduled';
      } else if (this.get('publishTarget.isPublished')) {
        return 'published';
      }

      return 'notpublished';
    }
  ),
  actions: {
    unpublish() {
      const publishTarget = this.publishTarget;
      publishTarget.set('publishedAsTbd', false);
      publishTarget.set('published', false);
      publishTarget.save().then(() => {
        this.flashMessages.success('general.unPublishedSuccessfully');
      });
    },
    publishAsTbd() {
      const publishTarget = this.publishTarget;
      publishTarget.set('publishedAsTbd', true);
      publishTarget.set('published', true);
      publishTarget.save().then(() => {
        this.flashMessages.success('general.scheduledSuccessfully');
      });
    },
    publish() {
      const publishTarget = this.publishTarget;
      publishTarget.set('publishedAsTbd', false);
      publishTarget.set('published', true);
      publishTarget.save().then(() => {
        this.flashMessages.success('general.publishedSuccessfully');
      });
    },
  },
});
