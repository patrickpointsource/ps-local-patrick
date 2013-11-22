'use strict';

/**
 * People Service
 */
angular.module('PSMasterMindApp')
  .factory('People', function () {
    var people = [
      {nick: 'kmbauer', mbox: 'kmbauer@pointsourcellc.com', name: 'Kevin Bauer', primaryRole: 'SSA', img: 'https://lh6.googleusercontent.com/-AfbvSfWmGCM/AAAAAAAAAAI/AAAAAAAAADI/KSa3oHOmErU/s92-c-k-no/photo.jpg'},
      {nick: 'chris.ketchuck', mbox: 'chris.ketchuck@pointsourcellc.com', name: 'Chris Ketchuck', primaryRole: 'SSE', img: 'https://lh4.googleusercontent.com/-1qfFqgxUS_g/AAAAAAAAAAI/AAAAAAAAAAA/S8qXyUNEqZU/s120-c/photo.jpg'},
      {nick: 'hunter.shepherd', mbox: 'hunter.shepherd@pointsourcellc.com', name: 'Hunter Shepherd', primaryRole: 'SE', img: 'https://lh4.googleusercontent.com/-p8EvoB3b_RA/AAAAAAAAAAI/AAAAAAAAAAA/JZ6nw2cQMFM/s120-c/photo.jpg'},
      {nick: 'brent.johnson', mbox: 'brent.johnson@pointsourcellc.com', name: 'Brent Johnson', primaryRole: 'SE', img: 'https://lh5.googleusercontent.com/-qPriteAfips/AAAAAAAAAAI/AAAAAAAAABI/SEuxJn7hsek/s120-c/photo.jpg'},
      {nick: 'eric.dudkowski', mbox: 'eric.dudkowski@pointsourcellc.com', name: 'Eric Dudkowski', primaryRole: 'SUXD', img: 'https://lh3.googleusercontent.com/-Vo54218--WM/AAAAAAAAAAI/AAAAAAAAADo/WOMSOM-WHQk/s120-c/photo.jpg'}
    ];

    function getPeople() {
      return people;
    }

    return {
      get: getPeople
    };
  });