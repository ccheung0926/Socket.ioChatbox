'use strict';

angular.module('chat', [])
  .controller('chatApp', ['socket', function(socket){
    var vm = this;
    vm.gotName = false;
    vm.chatStart = false;
    vm.clicked = false;
    vm.privateMsg = false;
    vm.receiver;
    vm.users = [];
    vm.messageStorage = {};

    vm.getUser = function(){
      console.log(vm.username);
      // vm.users.push(vm.username);
      socket.emit('clientToSeverGetName', vm.username);
      vm.gotName = true; 
      vm.chatStart = true;
    }

    vm.headerClicked = function(){
      console.log()
      if(!vm.clicked){
        vm.clicked = true;
      }
      else{
        vm.clicked = false;
      }
    }

    vm.createRoom = function(user){
      console.log('user',user);
      vm.privateMsg = true;
      vm.receiver = user;
    }

    socket.on('severToClientGiveName', function(data){
      vm.users = data;
      console.log('severToClientGiveName',vm.users);
    });
    //listener from the server, user receives message from other people
    socket.on('receivedMessage', function(data){
      console.log('data',data);
      if(vm.messageStorage.hasOwnProperty(data.from)){
        vm.messageStorage[data.from].push([ data.from, data.message ]);
      }
      else{
        vm.messageStorage[data.from] = [];
        vm.messageStorage[data.from].push([ data.from, data.message ]);
      }
      console.log('vm.messageStorage', vm.messageStorage); 
    });

    vm.sendMessage = function(){
      socket.emit('sendMsgToSever', {
        to: vm.receiver, 
        from: vm.username, 
        message: vm.message
      });
      if(vm.messageStorage.hasOwnProperty(vm.receiver)) {
        vm.messageStorage[vm.receiver].push([ vm.username, vm.message ]);
      }
      else{
        vm.messageStorage[vm.receiver] = [];
        vm.messageStorage[vm.receiver].push([ vm.username, vm.message ]);
      }
      vm.message = "";
    }

  }])

.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);