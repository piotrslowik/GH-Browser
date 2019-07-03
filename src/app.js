import './assets/scss/app.scss';
import $ from 'cash-dom';


export class App {
  initializeApp() {

    $('.load-username').on('click', e => {
      if (this.isInputValid()) {
        let userName = $('.username.input').val();

        $('#spinner').removeClass('is-hidden');
        this.getProfile(userName);
        this.getHistory(userName);
      }
    })
  }
  
  getProfile(userName) {
    fetch(`https://api.github.com/users/${userName}`)
    .then(response => {
      response.json()
      .then(body => {
        this.profile = body;
        this.updateProfile();
      })
    })
    .then(() => {
      $('#spinner').addClass('is-hidden');
    });
  }

  getHistory(userName) {
    this.clearTimeline();
    fetch(`https://api.github.com/users/${userName}/events/public`)
      .then(response => {
        response.json()
      .then(body => {
        const handledEvents = ['PullRequestEvent', 'PullRequestReviewCommentEvent'];
        const filteredEvents = body.filter(event => handledEvents.includes(event.type));
        filteredEvents.forEach(event => {
          $('.timeline').append(this.createTimelineItem(event));
        })
      })
    })
  }

  updateProfile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url)
    $('#profile-url').attr('href', this.profile.html_url).text(`@${this.profile.login}`)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }

  isInputValid() {
    const value = $('.username.input').val();
    const regex = /[a-z0-9_-]+/;
    return regex.test(value);
  }

  createTimelineItem(event) {
    const timelineItem = document.createElement("DIV");
    timelineItem.classList.add('timeline-item');

    const timelineMarker = document.createElement("DIV");
    timelineMarker.classList.add('timeline-marker');

    const timelineContent = document.createElement("DIV");
    timelineContent.classList.add('timeline-content');

    timelineContent.appendChild(this.createHeading(event));
    timelineContent.appendChild(this.createContent(event));
    
    timelineItem.appendChild(timelineMarker);
    timelineItem.appendChild(timelineContent);

    return timelineItem;
  }

  createHeading(event) {
    const heading = document.createElement('P');
    heading.classList.add('heading');
    heading.innerHTML = this.formatDate(event.created_at);
    return heading;
  }

  formatDate(time) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(time);
    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  createContent(event) {
    const content = document.createElement('DIV');
    content.classList.add('content');

    content.appendChild(this.createImg(event.actor.avatar_url));
    content.appendChild(this.createContentText(event));

    return content;
  }

  createImg(src) {
    const img = document.createElement('IMG');
    img.src = src;
    return img;
  }

  createContentText(event) {
    const contentText = document.createElement('DIV');
    contentText.classList.add('content__text');

    contentText.appendChild(this.createContentAction(event));
    contentText.appendChild(this.createRepoLink(event));

    return contentText;
  }
  
  createContentAction(event) {
    const contentAction = document.createElement('DIV');
    contentAction.classList.add('content__action');    

    contentAction.appendChild(this.createUsername(event.actor));
    this.createContentActionText(contentAction, event);

    return contentAction;
  }

  createUsername(user) {
    const username = document.createElement("A");
    username.classList.add('gh-username');
    username.innerHTML = user.display_login;
    username.href = `https://github.com/${user.login}`;
    return username;
  }

  createContentActionText(contentDiv, event) {
    const pr = document.createElement('A');
    pr.innerHTML = 'pull request';
    pr.href = event.payload.pull_request.html_url;

    switch (event.type) {
      case 'PullRequestEvent':
        const prAction = document.createElement('SPAN');
        prAction.innerHTML = event.payload.action;
        prAction.classList.add('gh-action');

        contentDiv.appendChild(prAction);
        contentDiv.appendChild(pr);
        break;
      case 'PullRequestReviewCommentEvent':
        const created = document.createElement('SPAN');
        created.innerHTML = 'created';
        const to = document.createElement('SPAN');
        to.innerHTML = 'to';
        const comment = document.createElement('A');
        comment.innerHTML = 'comment';
        comment.href = event.payload.comment.url;

        contentDiv.appendChild(created);
        contentDiv.appendChild(comment);
        contentDiv.appendChild(to);
        break;
    }
  }

  createRepoLink(event) {
    const repo = document.createElement('A');
    repo.href = event.repo.url;
    repo.innerHTML = event.repo.name;
    return repo;
  }

  clearTimeline() {
    $('#user-timeline').children().remove();
  }
}
