
/** ================================================================================
  * Browser Panel
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.cbBrowser", {

    options: {
      document: undefined,
      selected: function(item) { }
    },

    _create: function() {
      this.element.addClass('cb-browser');
      var $ul = $('<ul></ul>').appendTo(this.element);
      this._createNode($ul, this.options.document);

/*
      $ul.treeview({
        animated: "fast",
        collapsed: true,
        unique: true,
        persist: "cookie",
        toggle: function() {
        }
      });
*/
    },

    _createNode: function($parent, model) {
      var that = this;
      var $li = $('<li></li>').appendTo($parent);
      $li.click(function() {
        that._itemClicked(model);
        return false;
      });
      var $span = $('<span></span>').appendTo($li);
      $span.text(model.label);
      if( model.children && $.isArray(model.children) ) {
        var $ul = $('<ul></ul>').appendTo($li);
        $.each(model.children, function(index, child) {
          that._createNode($ul, child);
        });
      }
    },

    _itemClicked: function(item) {
      this.options.selected(item);
    }
 
  });

})(jQuery, document);


/** ================================================================================
  * Text editor
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.cbEditor", {

    options: {
      document: undefined
    },

    _create: function() {
      var that = this;
      this.element.addClass('cb-editor');
      var place = that.element.get()[0];
      this.editor = CodeMirror(place, {
        theme: 'cobalt'
      });
    },

    select: function(item) {
      this.editor.setValue(item.text);
    }
  });
})(jQuery, document);
  

/** ================================================================================
  * Code Browser
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.codeBrowser", {

    options: {
      document: undefined
    },

    _create: function() {
      var that = this;
      this.element.addClass('cb-frame');

      var browserOptions = $.extend({
        selected: function(item) {
          that.$editor.cbEditor('select', item);
        }
      }, this.options);
      this.$browser = $('<div></div>').cbBrowser(browserOptions).appendTo(this.element);


      var editorOptions = $.extend({
      }, this.options);
      this.$editor = $('<div></div>').appendTo(this.element);
      this.$editor.cbEditor(browserOptions);
    }

  });
})(jQuery, document);


