<template>
    <div>
        <img class="logoTW" src="/Logo_Teamwork.svg" alt="TeamWork" />
        <img class="logoCXP" src="/logo_corexpert.png" alt="Corexpert" />
        <md-tabs class="md-transparent tabsList" md-alignment="right" md-sync-route>
            <!-- AWS DEEPLENS GAME -->
            <md-tab id="tab-start" md-label="AWS DeepLens Game" md-icon="games" to="/">
                <center>
                  <div class="md-display-1" style="padding: 120px 16px 16px 16px;">Learn the American Sign Language alphabet</div>
                  <!-- NICKNAME PROMPT -->
                  <md-dialog id="twASLNickname" :md-active.sync="showNickname">
                    <div class="twDialog">
                      <div class="twPrompt" style="padding-top: 0px; padding-bottom: 0px;">
                        <div class="scoreInfo"><span>Score: </span></div>
                        <span>Nickname: </span><input id="inputNickname" type="text" class="form-control" /><br />
                        <md-button v-on:click="saveScore();" class="md-raised md-primary" style="float: right; margin-right: 0px;">Save it!</md-button>
                      </div>
                    </div>
                  </md-dialog>
                  <md-button class="triggerNickname" @click="showNickname = true"></md-button>
                  <md-button class="closeNickname" @click="showNickname = false"></md-button>
                  <!-- END NICKNAME PROMPT -->
                  <!-- CONGRATS PROMPT -->
                  <md-dialog id="twASLCongrats" :md-active.sync="showCongrats">
                    <div class="twDialog twDialogCongrats"><div class="twPrompt"><p class="congratsADLShortSentence"> CONGRATS! </p></div></div>
                  </md-dialog>
                  <md-button class="triggerCongrats" @click="showCongrats = true"></md-button>
                  <md-button class="closeCongrats" @click="showCongrats = false"></md-button>
                  <!-- END CONGRATS PROMPT -->
                  <!-- GAME OVER PROMPT -->
                  <md-dialog :md-active.sync="showGameOver">
                    <div class="twDialog twDialogGameOver"><div class="twPrompt"><p> GAME </p><p> OVER </p></div></div>
                  </md-dialog>
                  <md-button class="triggerGameOver" @click="showGameOver = true"></md-button>
                  <md-button class="closeGameOver" @click="showGameOver = false"></md-button>
                  <!-- END GAME OVER PROMPT -->
                  <!-- START + RESET BUTTON -->
                  <md-button id="easy" v-on:click="easyGame(); startGame(); getMessageWS();" class="easyGame md-dense md-raised md-primary">Easy</md-button>
                  <md-button id="medium" v-on:click="mediumGame(); startGame(); getMessageWS();" class="mediumGame md-dense md-raised md-primary">Medium</md-button>
                  <md-button id="hard" v-on:click="hardGame(); startGame(); getMessageWS();" class="hardGame md-dense md-raised md-primary">Hard</md-button>
                  <!-- END START + RESET BUTTON -->
                  <!-- CONTENT OF THE AWS DEEPLENS GAME -->
                  <div class="md-layout md-transparent" style="margin-top: 20px;">
                    <div class="md-layout-item md-size-15 shortSentenceASLImg" style="margin-top: 30px;"></div>
                    <div class="md-layout-item">
                      <md-progress-bar md-mode="determinate" class="pbScoreASL" style="display: none;" :md-value="score"></md-progress-bar>
                      <img id="aslDLImg" src="" height="400px" width="400px" />
                    </div>
                    <div class="lifeAndSpinner md-layout-item md-size-15">
                      <div class="lifes">
                        <img id="nbLife_3" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />
                        <img id="nbLife_2" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />
                        <img id="nbLife_1" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />
                      </div>
                      <md-progress-spinner class="pbTimeoutASL" :md-diameter="100" :md-stroke="10" md-mode="determinate" style="display: none;" :md-value="timeout"></md-progress-spinner>
                    </div>
                  </div>
                  <div class="md-layout md-transparent" style="margin-top: 30px;">
                    <div class="md-layout-item md-size-15">
                      <span class="md-title asLetter"></span>
                    </div>
                    <div class="md-layout-item">
                      <span class="md-title shortSentence"></span>
                      <br />
                      <div id="awsServicesImg"></div>
                    </div>
                    <div class="md-layout-item md-size-15"></div>
                  </div>
                  <!-- END CONTENT OF THE AWS DEEPLENS GAME -->
                </center>
            </md-tab>
            <!-- END AWS DEEPLENS GAME -->
            <!-- TOP SCORES -->
            <md-tab id="tab-scores" md-label="Top Scores" md-icon="star" to="/topscores">
                <center>
                    <div class="md-layout md-transparent" style="padding: 120px 16px 16px 16px;">
                        <div class="md-layout-item">
                            <md-table v-model="usersScoresList" md-sort="score" md-sort-order="desc" md-card md-fixed-header>
                              <md-table-row slot="md-table-row" slot-scope="{ item }">
                                <md-table-cell md-label="ID">{{ item.id }}</md-table-cell>
                                <md-table-cell md-label="Score" md-sort-by="score" md-numeric>{{ item.score }}</md-table-cell>
                              </md-table-row>
                            </md-table>
                        </div>
                    </div>
                </center>
            </md-tab>
            <!-- END TOP SCORES -->
        </md-tabs>
        <FocusKeyboard class="light"></FocusKeyboard>
  </div>
</template>

<script>
import scores from '~/static/asl_scores/scores.json'
import axios from 'axios'
const scoreToReach = 80 // SCORE VALUE TO BE PERFORMED BY END USERS
const toastOptions = { // TOAST PROMPT BAR
  theme: 'primary',
  fitToScreen: true,
  fullWidth: true,
  position: 'bottom-center',
  duration: 2000,
  icon: {
    after: true
  }
}

var gameStarted = false
var webSocket = null
var shortSentenceList
var shortSentence = ''
var nbLife = 3
var asLetter = ''
var score = 0
var timeout = 100
var timeoutCountdown
var strokeDashoffset = 0
var letterStep = 0
var letterPerformed = false
var winGame = false
var userScore = 0
var userScoreAux = 20

export default {
  data: () => {
    return {
      score: 0,
      timeout: 100,
      showCongrats: false,
      showGameOver: false,
      showNickname: false,
      usersScoresList: scores
    }
  },
  methods: {
    easyGame: function () {
      shortSentenceList = ['aws', 'lambda', 'emr', 'rds', 'iot', 'sqs', 'glue', 'chime', 'iam']
    },
    mediumGame: function () {
      shortSentenceList = ['kinesis', 'deeplens', 'polly', 'snowball', 'redshift', 'sagemaker', 'athena', 'glacier', 'neptune', 'alexa']
    },
    hardGame: function () {
      shortSentenceList = ['stepfunctions', 'cloudtrail', 'greengrass', 'cloudformation', 'elasticsearch', 'quicksight', 'dynamodb', 'beanstalk', 'cloudfront', 'cognito', 'apigateway']
    },
    saveScore () {
      var keyAux = null
      var minScore = null
      /* FETCHING EVERY NICKNAME/SCORE IN ORDER TO FIND THE LOWEST */
      for (var key in this.usersScoresList) {
        if (minScore === null || this.usersScoresList[key]['score'] < minScore) {
          keyAux = key
          minScore = this.usersScoresList[key]['score']
        }
      }
      /* END FETCHING EVERY NICKNAME/SCORE IN ORDER TO FIND THE LOWEST */
      if (this.usersScoresList.length === 0 || userScore >= minScore) {
        var params = {
          nickname: document.body.querySelector('#inputNickname').value,
          score: userScore
        }
        if (this.usersScoresList.length >= 20) {
          /* DELETING THE LOWEST NICKNAME/SCORE */
          params.scoreToBeDeleted = keyAux
        }
        axios.post('/api/score', params)
          .then(() => {
            document.body.querySelector('#inputNickname').value = ''
            document.body.querySelector('.closeNickname').click()
          })
          .catch((err) => {
            document.body.querySelector('#inputNickname').value = ''
            document.body.querySelector('.closeNickname').click()
            console.log(err)
          })
      }
    },
    startGame: function () {
      if (gameStarted) {
        this.resetGame()
      }
      gameStarted = true
      userScore = 0
      webSocket = new WebSocket('ws://127.0.0.1:8080')
      shortSentence = shortSentenceList[Math.floor(Math.random() * shortSentenceList.length)]
      asLetter = shortSentence.substring(0, 1)
      document.body.querySelector('.asLetter').innerHTML = asLetter.toUpperCase()
      document.body.querySelector('.shortSentence').innerHTML = asLetter.toUpperCase()
      document.body.querySelector('.shortSentenceASLImg').innerHTML = '<img src="/asl_examples/' + asLetter + '.png" alt="' + asLetter + '" />'
      document.body.querySelector('#awsServicesImg').innerHTML = '<img src="/aws_services/' + shortSentence + '.png" alt="' + shortSentence + '" />'
      document.body.querySelector('.pbScoreASL').style.display = 'flex'
      document.body.querySelector('.pbTimeoutASL').style.display = 'flex'
      document.body.querySelector('.lifes').style.display = 'inline'
    },
    timeOutASL: function () {
      /* TIMEOUT MANAGEMENT - EXECUTED EVERY SECOND */
      timeoutCountdown = setInterval(() => {
        timeout -= 5
        userScoreAux -= 1
        strokeDashoffset += 14.15
        document.body.querySelector('.pbTimeoutASL .md-progress-spinner-circle').setAttribute('style',
          'stroke-dashoffset: ' + strokeDashoffset + 'px; stroke-dasharray: 283px; stroke-width: 10px; animation-name: md-progress-spinner-stroke-rotate-100;')
        if (timeout === 50 && !letterPerformed) {
          toastOptions.icon.name = 'notification_important'
          this.$toasted.info('10 seconds remaining!', toastOptions)
        }
        if (timeout === 0 && !letterPerformed && nbLife > 0) {
          // LETTER NOT PERFORMED BY THE END USER - GOING TO THE NEXT ONE
          nbLife -= 1
          if (nbLife === 0) {
            // THE END USER LOSES THE AWS DEEPLENS GAME - LOSER
            document.body.querySelector('.triggerGameOver').click()
            clearInterval(timeoutCountdown)
            this.resetGame()
          } else {
            toastOptions.icon.name = 'error_outline'
            this.$toasted.error('Too late!', toastOptions)
            document.body.querySelector('#nbLife_' + nbLife).remove()
            letterPerformed = true
            letterStep += 1
            timeout = 100
            userScoreAux = 20
            strokeDashoffset = 0
            clearInterval(timeoutCountdown)
            this.timeOutASL()
          }
        }
      }, 1000)
      /* END TIMEOUT MANAGEMENT - EXECUTED EVERY SECOND */
    },
    getMessageWS: function () {
      webSocket.onopen = (event) => {
        this.timeOutASL()
        webSocket.onmessage = (event) => {
          var data = JSON.parse(event.data)
          document.body.querySelector('#aslDLImg').setAttribute('src', 'data:image/jpeg;base64, ' + data.jpeg)
          delete data.jpeg
          /* GO TO THE NEXT LETTER TO BE PERFORMED */
          if (letterPerformed) {
            asLetter = shortSentence.substring(letterStep, letterStep + 1)
            if (asLetter === '') {
              // AWS DEEPLENS GAME FINISHED!
              winGame = true
              this.$toasted.clear()
              document.body.querySelector('.triggerCongrats').click()
              document.body.querySelector('.congratsADLShortSentence').innerHTML = '<p class="congratsADLShortSentence"> ' + shortSentence.toUpperCase() + ' </p>'
              this.resetGame()
            } else {
              letterPerformed = false
              document.body.querySelector('.asLetter').innerHTML = asLetter.toUpperCase()
              document.body.querySelector('.shortSentence').innerHTML += asLetter.toUpperCase()
              document.body.querySelector('.shortSentenceASLImg').innerHTML = '<img src="/asl_examples/' + asLetter + '.png" alt="' + asLetter + '" />'
              document.body.querySelector('.pbTimeoutASL .md-progress-spinner-circle').setAttribute('style',
                'stroke-dashoffset: 0px; stroke-dasharray: 283px; stroke-width: 10px; animation-name: md-progress-spinner-stroke-rotate-100;')
            }
          }
          /* END GO TO THE NEXT LETTER TO BE PERFORMED */
          if (nbLife > 0) {
            score = (data[asLetter] * 100) * 2
            if (score >= scoreToReach && !letterPerformed) {
              score = 0
              userScore += userScoreAux
              userScoreAux = 20
              timeout = 100
              strokeDashoffset = 0
              letterPerformed = true
              letterStep += 1
              toastOptions.icon.name = 'check_circle_outline'
              this.$toasted.success('Well-done!', toastOptions)
            }
            /* CALCULATE & DISPLAY COLORS ONTO THE PROGRESS BAR */
            var redRGB = 255 - (score * 5)
            var greenRGB = 255
            if (score < 50) {
              redRGB = 255
              greenRGB = score * 5
              // UGLY code to display a nice progress bar
              score = score * (100 / scoreToReach)
            } else {
              // UGLY code to display a nice progress bar
              score = score * (100 / scoreToReach)
              if (score > 100) {
                score = 100
              }
            }
            document.body.querySelector('.pbScoreASL .md-progress-bar-fill').style.background = 'rgb(' + redRGB + ',' + greenRGB + ',0)'
            document.body.querySelector('.pbScoreASL .md-progress-bar-fill').style.width = score + '%'
            /* END CALCULATE & DISPLAY COLORS ONTO THE PROGRESS BAR */
          }
        }
      }
    },
    resetGame: function () {
      clearInterval(timeoutCountdown)
      webSocket.close()
      gameStarted = false
      shortSentence = ''
      asLetter = ''
      score = 0
      userScoreAux = 20
      timeout = 100
      strokeDashoffset = 0
      letterStep = 0
      letterPerformed = false
      nbLife = 3
      document.body.querySelector('#aslDLImg').setAttribute('src', '')
      document.body.querySelector('.pbScoreASL .md-progress-bar-fill').style.width = '0%'
      document.body.querySelector('.pbScoreASL').style.display = 'none'
      document.body.querySelector('.pbTimeoutASL').style.display = 'none'
      document.body.querySelector('.lifes').style.display = 'none'
      document.body.querySelector('.lifes').innerHTML = '<img id="nbLife_3" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />'
      document.body.querySelector('.lifes').innerHTML += '<img id="nbLife_2" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />'
      document.body.querySelector('.lifes').innerHTML += '<img id="nbLife_1" class="nbLife" src="/awsdlg_life.png" alt="1 Life" />'
      document.body.querySelector('.shortSentenceASLImg').innerHTML = ''
      document.body.querySelector('#awsServicesImg').innerHTML = ''
      document.body.querySelector('.asLetter').innerHTML = ''
      document.body.querySelector('.shortSentence').innerHTML = ''
      if (winGame) {
        setTimeout(() => {
          document.body.querySelector('.closeCongrats').click()
          document.body.querySelector('.triggerNickname').click()
          setTimeout(() => {
            document.body.querySelector('.scoreInfo').innerHTML = '<span>Score: ' + userScore + '</span>'
          }, 1000)
        }, 5000)
        winGame = false
      } else {
        setTimeout(() => {
          document.body.querySelector('.closeGameOver').click()
        }, 5000)
      }
    }
  }
}
</script>
