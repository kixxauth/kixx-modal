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

    // opts.topMargin
    // opts.bottomMargin
    // opts.position
    open: function (opts) {
      opts = opts || {};
      opts.position = opts.position === undefined ? true : opts.position

      var complete = refunct(opts, 'complete')
        , $this = this
        , comps
        , css

      if (this.data('kixxModalLocked') || this.data('kixxModalOpen')) {
        return this;
      }

      this.data('kixxModalLocked', true);

      opts.complete = function () {
        $this.data('kixxModalOpen', true);
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:opened');
        complete.call(this);
      };

      kixxModal.$overlay().fadeIn(200);
      $this.fadeIn(opts);

      comps = computeHeight.call(this, opts);
      if (comps.topMargin || opts.position) {
        css = {position: 'absolute'};
        if (comps.topMargin) {
          css.top = comps.topMargin;
        }
        css.width = this.find('.modal-content').outerWidth(true);
        css.marginLeft = -Math.round(css.width / 2);
        css.left = "50%";
        this.css(css);
      }
      if (comps.innerHeight) {
        this.find('.modal-content').css({maxHeight: comps.innerHeight});
      }

      this.trigger('kixx-modal:opening');

      return this;
    },

    close: function (opts) {
      opts = opts || {};
      var complete = refunct(opts, 'complete')
        , $this = this

      if (this.data('kixxModalLocked') || !this.data('kixxModalOpen')) {
        return this;
      }

      this.data('kixxModalLocked', true);

      opts.complete = function () {
        $this.data('kixxModalOpen', false);
        $this.data('kixxModalLocked', false);
        $this.trigger('kixx-modal:closed');
        complete.call(this);
      };

      kixxModal.$overlay().fadeOut(200);
      this.fadeOut(opts);
      this.trigger('kixx-modal:closing');
      return this;
    }
  };

  function computeHeight(opts) {
    opts.topMargin = opts.topMargin || (opts.position ? 0.1 : 0);
    opts.bottomMargin = opts.bottomMargin || (opts.position ? 0.1 : 0);

    var header = this.find('.modal-header').outerHeight(true) || 0
      , footer = this.find('.modal-footer').outerHeight(true) || 0
      , borderPadding = this.outerHeight() - this.innerHeight()
      , win = $(window).innerHeight()
      , topMargin = Math.floor(opts.topMargin * win)
      , bottomMargin = Math.floor(opts.bottomMargin * win)
      , innerHeight = 0

    if (topMargin || bottomMargin) {
      innerHeight = Math.floor(win - topMargin - header - footer - borderPadding - bottomMargin);
    }

    return {topMargin: topMargin, innerHeight: innerHeight};
  }

  kixxModal.createDeck = function (opts) {
    opts = opts || {};

    var self = {}
      , dispatcher = $({})
      , closeOptions = opts.close || {}
      , openOptions = opts.open || {}
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

    self.open = function (id, callback) {
      id = id.toString();
      if (locked || current == id) return this;

      var el = document.getElementById(id)
      if (!el) return this;

      var $modal = initializeModal(el);

      locked = true;
      callback = refunct(callback);

      function doOpen() {
        var opts = $.extend({}, openOptions)
          , complete = refunct(opts, 'complete')

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

    self.close = function (callback) {
      if (locked || !current) return this;
      locked = true;

      var opts = $.extend({}, closeOptions)
        , complete = refunct(opts, 'complete')

      callback = refunct(callback);

      opts.complete = function () {
        current = null;
        locked = false;
        complete.call(this);
        callback();
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
          dispatcher.trigger(evname);
        });
      });

      $modal.find('.close-modal').on('click', function (ev) {
        ev.preventDefault();
        self.close();
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
