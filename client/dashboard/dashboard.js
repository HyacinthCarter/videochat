import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { VideoCallServices } from "meteor/elmarti:video-chat";
const statusText = new ReactiveVar("");

Template.dashboard.onCreated(() => {
  VideoCallServices.init({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" }
    ]
  });
  VideoCallServices.onReceiveCall = userId => {
    const user = Meteor.users.findOne({
      _id: userId
    });
    statusText.set(`Receiving call from ${user.emails[0].address}`);
  };
  VideoCallServices.onTargetAccept = () => {
    statusText.set("Target Accepted");
  };
  VideoCallServices.onTerminateCall = () => {
    statusText.set("Call Terminated");
  };
  VideoCallServices.onCallRejected = () => {
    statusText.set("Call Rejected");
  };
  VideoCallServices.setOnError(err => {
    console.log(err);
    statusText.set(err);
  });
});

Template.dashboard.helpers({
  getUsers() {
    const users = [];
    Meteor.users
      .find({
        _id: {
          $ne: Meteor.userId()
        }
      })
      .forEach(user =>
        users.push({
          email: user.emails[0].address,
          status:
            user.status.online !== undefined ? user.status.online : undefined,
          _id: user._id
        })
      );
    return users;
  },
  getState(key) {
    return VideoCallServices.getState(key);
  },
  getStatusText() {
    return statusText.get();
  }
});

Template.dashboard.events({
  "click .user-button"() {
    if (this.status) {
      VideoCallServices.call({
        id: this._id,
        localElement: document.querySelector("#localVideo"),
        remoteElement: document.querySelector("#remoteVideo"),
        video: true,
        audio: true
      });
      statusText.set(`Calling ${this.email}`);
    }
  },
  "click .answer-call"(){
    VideoCallServices.answerCall({
      localElement: document.querySelector('#localVideo'),
      remoteElement: document.querySelector('#remoteVideo'),
      video: true,
      audio: true
    });
    statusText.set('Connected');
  },
  "click .reject-call"(){
    VideoCallServices.rejectCall();
    statusText.set('Call Rejected');
  },
  "click .end-call"(){
    VideoCallServices.endCall();
    statusText.set('Call Ended');
  }
});
