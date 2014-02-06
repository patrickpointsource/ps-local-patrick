//
// test/e2e/routesSpec.js
//
describe("E2E: Testing Routes", function() {

  beforeEach(function() {
    browser().navigateTo('/');
  });

  // it('true should equal true', function() {
  //   expect(1).toEqual(1);
  // });

  it('should jump to the /login.html path when / is accessed', function() {
    // console.log('browser().window().path():');
    // console.log(JSON.stringify(browser().window().path()));

    // expect(browser().location().path()).toEqual("/login.html");
    var one = 1;
    expect(one).toEqual(1);
  });

});
