with (scope()) {

  test("basic", function() {
    ok(document.body.innerText.indexOf("The funding platform for open-source software.") >= 0);
  });

}