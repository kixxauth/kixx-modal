(function (window, document, $) {
  var kixxModal
    , $overlay = null

  $.fn.kixxModal = kixxModal = function (method, opts) {
    kixxModal.methods[method].call(this, opts);
    return this;
  };

  kixxModal.methods = {
    register: function (opts) {
      opts = opts || {};
      var openOptions = opts.open
        , closeOptions = opts.close
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

    // opts.staticPosition
    open: function (opts) {
      opts = opts || {};

      var complete = refunct(opts, 'complete')
        , $this = this

      if (this.data('kixxModalLocked') || this.data('kixxModalOpen')) {
        return complete.call(this, false);
      }

      this.data('kixxModalLocked', true);
      this.data('kixxModalOptions', opts);

      opts.complete = function () {
        $this.data('kixxModalOpen', true);
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:opened');
        complete.call(this, true);
      };

      function close() {
        kixxModal.$overlay().off('click', close);
        $this.kixxModal('close');
      }

      kixxModal.$overlay().fadeIn(200).on('click', close);

      this.fadeIn(opts);
      position.call(this, opts);

      this.trigger('kixx-modal:opening');
      return this;
    },

    close: function (opts) {
      opts = opts || this.data('kixxModalOptions') || {};

      var complete = refunct(opts, 'complete')
        , $this = this

      if (this.data('kixxModalLocked') || !this.data('kixxModalOpen')) {
        return complete.call(this, false);
      }

      this.data('kixxModalLocked', true);

      opts.complete = function () {
        $this.data('kixxModalOpen', false);
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:closed');
        complete.call(this, true);
      };

      kixxModal.$overlay().fadeOut(200);
      this.fadeOut(opts);
      
      this.trigger('kixx-modal:closing');
      return this;
    }
  };

  function position(opts) {
    if (opts.staticPosition) {
      this.css(opts.staticPosition);
    } else {
      var h = this.outerHeight()
        , w = this.outerWidth()

      this.css({
        marginLeft: -(w/2)
      , marginTop: -(h/2)
      });
    }
  }

  kixxModal.createDeck = function (gOpenOptions, gCloseOptions) {
    gOpenOptions = gOpenOptions || {};
    gCloseOptions = gCloseOptions || {};

    var self = {}
      , dispatcher = $({})
      , cache = {}
      , current = null
      , locked = false

    self.on = function (event, handler) {
      dispatcher.on.apply(dispatcher, arguments);
      return self;
    };

    self.off = function (event, handler) {
      dispatcher.off.apply(dispatcher, arguments);
      return self;
    };

    self.one = function (event, handler) {
      dispatcher.one.apply(dispatcher, arguments);
      return self;
    };

    self.open = function (id, openOptions, closeOptions) {
      id = id.toString();
      openOptions = openOptions || {};
      closeOptions = closeOptions || {};

      var complete = refunct(openOptions, 'complete')
        , el = document.getElementById(id)

      if (locked || current == id || !el) {
        complete.call(this, false);
        return this;
      }

      function doOpen() {
        var $modal = initializeModal(el)
          , opts = $.extend(openOptions || {}, gOpenOptions)
          , complete = refunct(opts, 'complete')

        opts.complete = function () {
          current = id;
          locked = false;
          complete.call(this, true);
        }

        $modal.kixxModal('open', opts);
      }

      if (current) {
        var opts = $.extend(closeOptions || {}, gCloseOptions)
        complete = refunct(opts, 'complete')

        opts.complete = function () {
          current = null;
          complete.call(this, true);
          doOpen();
        };
        cache[current].kixxModal('close', opts);
      } else {
        doOpen();
      }
      return this;
    };

    self.closeAll = function (opts) {
      var opts = $.extend(opts || {}, gCloseOptions)
        , complete = refunct(opts, 'complete')

      if (locked || !current) {
        complete.call(this, false);
        return this;
      }

      locked = true;

      opts.complete = function () {
        current = null;
        locked = false;
        complete.call(this, true);
      };
      cache[current].kixxModal('close', opts);
    };

    function initializeModal(el) {
      if (cache[el.id]) {
        return cache[el.id];
      }

      var $modal = $(el)
        , events = [
            'kixx-modal:opening'
          , 'kixx-modal:open'
          , 'kixx-modal:closing'
          , 'kixx-modal:closed'
          ]

      $.each(events, function (i, evname) {
        $modal.on(evname, function (ev) {
          dispatcher.trigger(evname, [$modal[0]]);
        });
      });

      $modal.find('.close-modal').on('click', function (ev) {
        ev.preventDefault();
        self.closeAll();
      });

      return cache[el.id] = $modal;
    }

    return self;
  };

  kixxModal.$overlay = function () {
    if (!$overlay) {
      $overlay = $('<div id="kixx-modal-overlay"></div>')
        .appendTo($('body'))
    }
    return $overlay;
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

  $.kixxModal = kixxModal;

}(window, document, jQuery));
