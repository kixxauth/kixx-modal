(function (window, document, $) {
  var kixxModal

  $.fn.kixxModal = kixxModal = function (method, opts) {
    kixxModal.methods[method].call(this, opts);
    return this;
  };

  kixxModal.methods = {
    register: function (opts) {
      opts = opts || {};
      var openOptions = opts.openOptions
        , closeOptions = opts.closeOptions
        , id = kixxModal.hashToId($(this).attr('href'))
        , $modal = $('#'+ id)

      this.on('click', function (ev) {
        ev.preventDefault();
        $modal.kixxModal('open', openOptions);
      });

      $('#'+ id).find('.close-modal').on('click', function (ev) {
        ev.preventDefault();
        $modal.kixxModal('close', closeOptions);
      });
      return this;
    },

    open: function (opts) {
      opts = opts || {};
      var complete = refunct(opts, 'complete')
        , $this = this

      if (this.data('kixxModalLocked')) {
        return this;
      }

      this.data('kixxModalLocked', true);

      opts.complete = function () {
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:opened');
        complete.call(this);
      };

      this.fadeIn(opts);
      this.trigger('kixx-modal:opening');
      return this;
    },

    close: function (opts) {
      opts = opts || {};
      var complete = refunct(opts, 'complete')
        , $this = this

      if (this.data('kixxModalLocked')) {
        return this;
      }

      this.data('kixxModalLocked', true);

      opts.complete = function () {
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:closed');
        complete.call(this);
      };

      this.fadeOut(opts);
      this.trigger('kixx-modal:closing');
      return this;
    }
  };

  kixxModal.modalDeck = function (opts) {
    opts = opts || {};

    var self = {}
      , closeOptions = opts.close || {}
      , openOptions = opts.open || {}
      , cache = {}
      , current = null
      , locked = false

    self.open = function (id, callback) {
      id = id.toString();
      if (locked || current == id) return this;

      locked = true;
      callback = refunct(callback);

      function doOpen() {
        var $modal
          , opts = $.extend({}, openOptions)
          , complete = refunct(opts, 'complete')

        if (!($modal = cache[id])) {
          $modal = cache[id] = $('#'+ id);
        }

        opts.complete = function () {
          current = id;
          locked = false;
          complete.call(this);
          callback();
        }

        $modal.kixxModal('open', opts);
      }

      if (current) {
        var opts = $.extend({}, closeOptions)
          , complete = refunct(opts, 'complete')

        opts.complete = function () {
          current = null;
          complete.call(this);
          doOpen();
        };
        cache[current].kixxModal('close', opts);
      } else {
        doOpen();
      }
      return this;
    };

    return self;
  };

  kixxModal.hashToId = function (str) {
    return str.replace(/^#/, '');
  };

  kixxModal.noop = function () {};

  function refunct(obj, name) {
    if (arguments.length < 2) {
      return $.isFunction(obj) ? obj : kixxModal.noop;
    }
    return $.isFunction(obj[name]) ? obj[name] : kixxModal.noop;
  }

}(window, document, jQuery));
