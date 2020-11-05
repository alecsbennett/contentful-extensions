window.contentfulExtension.init(function(api) {
  function tinymceForContentful(api) {
    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var p = tweak(api.parameters.instance.plugins);
    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);  

    api.window.startAutoResizer();

    tinymce.init({
      selector: "#editor",
      /*plugins: p,
      toolbar: tb,
      menubar: mb,*/
      plugins: 'print paste importcss searchreplace autolink directionality code visualblocks visualchars image link template ' +
          'table charmap hr nonbreaking anchor toc advlist lists wordcount imagetools textpattern noneditable help charmap quickbars',
      external_plugins: {
        'flags': '/plugins/flags/plugin.min.js',
        'cfDictionary': '/plugins/cf-dictionary/plugin.js'
      },
      menubar: 'edit insert view format table tools help',
      menu: {
        edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
        insert: { title: 'Insert', items: 'image link template codesample inserttable | charmap hr | nonbreaking anchor toc' },
        view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker' },
        format: { title: 'Format', items: 'bold italic strikethrough superscript subscript codeformat | formats blockformats | removeformat' },
        table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
        tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
        help: { title: 'Help', items: 'help' }
      },
      toolbar1: 'undo redo | bold italic strikethrough | formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  '
       + 'numlist bullist',
      toolbar2: 'charmap emoticons | print | insertfile image media template link anchor codesample | ltr rtl | cfTogglePreview cfDictionary',
      toolbar_sticky: true,
      quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
      content_style: 'div.cms-dictionary { display:inline-block; } ' 
        + '.dictionary-preview span.cms-dictionary-preview { display: inherit; } ' + 'span.cms-dictionary-preview { display: none; } ' 
        + '.dictionary-preview span.cms-dictionary-edit { display: none; } ' + 'span.cms-dictionary-edit { display: inherit; } ',
      min_height: 600,
      max_height: 750,
      autoresize_bottom_margin: 15,
      resize: true,
      statusbar: true,
      image_advtab: true,
      image_caption: true,
      init_instance_callback : function(editor) {
        var listening = true;

        function getEditorContent() {

          var c = editor.getContent() || '';

          c = c.replace( /<div class="cms-dictionary">.*?<span class="cms-dictionary-edit">(.*?)<\/span><\/div>/, "$1" );

          return c;
        }

        function getApiContent() {

          var c = api.field.getValue() || '';

          c = c.replace( /({{ cfdictionary (.*?) \"(.*?)\" }})/, '<div class="cms-dictionary"><span class="cms-dictionary-preview">$3</span><span class="cms-dictionary-edit">$1</span></div>' );

          return c;
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            var c = apiContent.replace( /({{ cfdictionary (.*?) \"(.*?)\" }})/, '<div class="cms-dictionary"><span class="cms-dictionary-preview">$3</span><span class="cms-dictionary-edit">$1</span></div>' );

            editor.setContent(c);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function(x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field.setValue(editorContent).then(function() {
              listening = true;
            }).catch(function(err) {
              console.log("Error setting content", err);
              listening = true;
            });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, {leading: true});
        editor.on('change keyup setcontent blur', throttled);
      }
    });
  }

  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub = location.host == "contentful.staging.tiny.cloud" ? "cdn.staging" : "cdn";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  var tinymceUrl = "https://" + sub + ".tiny.cloud/1/" + apiKey + "/tinymce/" + channel + "/tinymce.min.js";

  loadScript(tinymceUrl, function() {
    tinymceForContentful(api);
  });
});
