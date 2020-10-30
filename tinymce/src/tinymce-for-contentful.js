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
	
	tweak(api.parameters.instance.pluginCode);
	
	tinymce.PluginManager.add('example', function(editor, url) {
	  var openDialog = function () {
		return editor.windowManager.open({
		  title: 'Example plugin',
		  body: {
			type: 'panel',
			items: [
			  {
				type: 'input',
				name: 'title',
				label: 'Title'
			  }
			]
		  },
		  buttons: [
			{
			  type: 'cancel',
			  text: 'Close'
			},
			{
			  type: 'submit',
			  text: 'Save',
			  primary: true
			}
		  ],
		  onSubmit: function (api) {
			var data = api.getData();
			// Insert content when the window form is submitted
			editor.insertContent('Title: ' + data.title);
			api.close();
		  }
		});
	  };

	  // Add a button that opens a window
	  editor.ui.registry.addButton('example', {
		text: 'My button',
		onAction: function () {
		  // Open window
		  openDialog();
		}
	  });

	  // Adds a menu item, which can then be included in any menu via the menu/menubar configuration
	  editor.ui.registry.addMenuItem('example', {
		text: 'Example plugin',
		onAction: function() {
		  // Open window
		  openDialog();
		}
	  });

	  return {
		getMetadata: function () {
		  return  {
			name: 'Example plugin',
			url: 'http://exampleplugindocsurl.com'
		  };
		}
	  };
	});

    tinymce.init({
      selector: "#editor",
      plugins: p,
      toolbar: tb,
      menubar: mb,
      min_height: 600,
      max_height: 750,
      autoresize_bottom_margin: 15,
      resize: false,
      image_caption: true,
      init_instance_callback : function(editor) {
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || '';
        }

        function getApiContent() {
          return api.field.getValue() || '';
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
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
