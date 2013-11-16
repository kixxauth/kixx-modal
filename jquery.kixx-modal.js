(function (window, document, $) {

  function createModalDeck(opts) {
    var self = {}
      , currentlyOpen = null

    self.open = function (id, callback) {
      id = trimId(id);

      if (id == currentlyOpen) {
        if ($.isFunction(callback)) {
          callback();
        }
        return this;
      }

      var $modal

      $('#'+ currentlyOpen).kixxModal('close', opts, function () {
        $modal.kixxModal('open', opts, function () {
          if ($.isFunction(callback)) {
            callback();
          }
        });
      });

      return this;
    };

    return self;
  }

  function trimId(str) {
    return str.replace(/^#/, '');
  }

}(window, document, jQuery));
