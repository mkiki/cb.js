/** ================================================================================
  * Code Browser object
  * ================================================================================ */
cb = (function($) {
  return {
    newModel: function(content, label) {
      var lines = content.split('\n');
      var doc = {
        icon: 'root',
        label: label,
        children: [],
        //text: '',
        lines: [],
        index: {}
      };

      var stack = [ doc ];
      var row = -1;
      $.each(lines, function(index, line) {
        row = row + 1;
        var h5 = line.substr(0, 5);
        var h6 = line.substr(0, 6);
        if( h6 === '#[of]:' ) {
          line = line.substr(6);
          var parent = stack[stack.length-1];
          var item = { icon: 'fold', label: line, row: row, children: [], text:'', lines: [], parent: parent.row };
          parent.lines.push( { text: line, type: 'fold', item: item, parent: parent.row, row: row } );
          parent.children.push(item);
          doc.index[row] = item;
          stack.push(item);
        }
        else if( h5 === '#[cf]') {
          stack.pop();
        }
        else {
          var parent = stack[stack.length-1];
          //parent.text = parent.text + line + '\n';
          parent.lines.push( { text: line, type: 'data', parent: parent.row, row: row } );
        }
      });
      console.log(doc);
      return doc;
    },

    lineToHTML: function(line) {
      if( line === '' )
        line = '\xa0';
      return line;
    },

    HTMLToLine: function(html) {
      if( html === '\xa0' )
        html = '';
      return html;
    }
  };
})(jQuery);


/** ================================================================================
  * Browser Panel
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.cbBrowser", {

    options: {
      document: undefined,
      selected: function(item) { }
    },

    index: {},
    selection: -1,

    _create: function() {
      this.element.addClass('cb-browser');
      this._createNode(this.element, this.options.document);
    },

    _createNode: function($parent, model) {
      if( model.children && $.isArray(model.children) ) {
        var that = this;
        var $ul = $('<ul></ul>').appendTo($parent);
        $.each(model.children, function(index, child) {
          var $li = $('<li></li>').appendTo($ul);
          that.index[child.row] = $li;
          $li.click(function() {
            that._itemClicked(child, $li);
            return false; // prevent bubbling
          });
          var $span = $('<span></span>').appendTo($li);
          $span.text(child.label);
          that._createNode($li, child);
        });
      }
    },

    _itemClicked: function(item, $li) {
      this.options.selected(item); // callback
    },

    select: function(row) {
      $('li', this.element).attr('selected', null); // deselet all
      var $li = this.index[row];
      if( $li ) {
       $li.attr('selected', 'selected');
      }
      this.selection = row;
    }
 
  });

})(jQuery, document);


/** ================================================================================
  * Text editor
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.cbEditor", {

    options: {
      document: undefined,
      openFold: function(item) { }
    },

    $body: undefined,

    _create: function() {
      var that = this;
      this.element.addClass('cb-editor');
      /*
      var place = that.element.get()[0];
      this.editor = CodeMirror(place, {
        theme: 'cobalt'
      });
      */
      this.$body = $('<div></div>').addClass('body').appendTo(this.element);
    },

    select: function(row) {
      var that = this;
      var count = 0;
      var item = this.options.document.index[row];
      //this.editor.setValue(item.text);
      this.$body.children().remove();
      if( item ) {
        $.each(item.lines, function(index, line) {
          count = count + 1;
          var $pre = $('<pre></pre>').addClass('line').appendTo(that.$body);
          $pre.addClass(line.type);
          $pre.text(cb.lineToHTML(line.text));
          if( line.type === 'fold' ) {
            $pre.click(function(evt) {
              that._foldClicked(line.item, $pre);
              return false; // prevent bubbling
            });
          }
        });
      }

      while( count < this.options.rows) {
        count = count + 1;
        var $pre = $('<pre></pre>').addClass('line').appendTo(that.$body);
        $pre.text('\xa0');
      }
    },

    _foldClicked: function(item, $pre) {
      this.options.openFold(item);
    }

  });
})(jQuery, document);
  

/** ================================================================================
  * Code Browser
  * ================================================================================ */
(function($, document) {
  $.widget( "ui.codeBrowser", {

    options: {
      document: undefined,
      rows: 4
    },

    _create: function() {
      var that = this;
      this.element.addClass('cb-frame');

      var browserOptions = $.extend({
        selected: function(item) {
          that._show(item.row);
        }
      }, this.options);
      this.$browser = $('<div></div>').cbBrowser(browserOptions).appendTo(this.element);


      var editorOptions = $.extend({
        openFold: function(item, $pre) {
          that._show(item.row);
        }
      }, this.options);
      this.$editor = $('<div></div>').appendTo(this.element);
      this.$editor.cbEditor(editorOptions);

      that.element.bind('open-fold', function(event, data) {
        console.log('Opening fold', data);
        return false;
      });

      this._show(0);
    },

    _show: function(row) {
      this.$browser.cbBrowser('select', row);
      this.$editor.cbEditor('select', row);
    }

  });
})(jQuery, document);


