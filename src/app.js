import './assets/scss/app.scss';
import $ from 'cash-dom';


export class App {
  initializeApp() {
    let self = this;

    $('.load-username').on('click', e => {
      if (this.isInputValid()) {
        let userName = $('.username.input').val();

        fetch(`https://api.github.com/users/${userName}`)
          .then(response => {
          response.json()
          .then(body => {
            self.profile = body;
            self.update_profile();
          })
          })
      }
    })

  }

  update_profile() {
    $('#profile-name').text($('.username.input').val())
    $('#profile-image').attr('src', this.profile.avatar_url)
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login)
    $('#profile-bio').text(this.profile.bio || '(no information)')
  }

  isInputValid() {
    const value = $('.username.input').val();
    const regex = /[a-z0-9_-]+/;
    return regex.test(value);
  }
}
