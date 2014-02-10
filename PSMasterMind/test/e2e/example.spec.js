// describe('angularjs homepage', function() {
//   it('should greet the named user', function() {
//     browser.get('http://www.angularjs.org');

//     element(by.model('yourName')).sendKeys('Julie');

//     var greeting = element(by.binding('yourName'));

//     expect(greeting.getText()).toEqual('Hello Julie!');
//   });

//   describe('todo list', function() {
//     var todoList;

//     beforeEach(function() {
//       browser.get('http://www.angularjs.org');

//       todoList = element.all(by.repeater('todo in todos'));
//     });

//     it('should list todos', function() {
//       expect(todoList.count()).toEqual(2);
//       expect(todoList.get(1).getText()).toEqual('build an angular app');
//     });

//     it('should add a todo', function() {
//       var addTodo = element(by.model('todoText'));
//       var addButton = element(by.css('[value="add"]'));

//       addTodo.sendKeys('write a protractor test');
//       addButton.click();

//       expect(todoList.count()).toEqual(3);
//       expect(todoList.get(2).getText()).toEqual('write a protractor test');
//     });
//   });
// });




// describe('Homepage', function() {

//   beforeEach(function(){
//     browser.get('http://0.0.0.0:9000/login.html');
//   });

//   it('should redirect to the login page if trying to load protected page while not authenticated', function() {
//     console.log('getCurrentUrl: ', browser.getCurrentUrl());

//     expect(browser.getCurrentUrl()).toEqual(browser.getCurrentUrl());
//   });

// });